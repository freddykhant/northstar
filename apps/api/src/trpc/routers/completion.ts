import { computeStats, daysBetween, type CategoryId, type LocalDate, type Stats } from "@squii/core";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, isNull, lte } from "drizzle-orm";
import { z } from "zod";
import { completion, habit } from "../../db/schema.ts";
import { assertBackfillable, assertPlausibleToday, localDateInput } from "../dates.ts";
import { protectedProcedure, router } from "../init.ts";
import { habitColumns, habitOrderBy, type Habit } from "./habit.ts";

const habitId = z.number().int().positive().max(2147483647);

export const completionRouter = router({
  ink: protectedProcedure
    .input(z.object({ habitId, date: localDateInput, today: localDateInput }))
    .mutation(async ({ ctx, input }) => {
      assertPlausibleToday(input.today, ctx.now());
      assertBackfillable(input.date, input.today);
      const habits = await ctx.db
        .select({ categoryId: habit.categoryId })
        .from(habit)
        .where(and(eq(habit.id, input.habitId), eq(habit.userId, ctx.userId), isNull(habit.archivedAt)))
        .limit(1);
      const h = habits[0];
      if (!h) throw new TRPCError({ code: "NOT_FOUND", message: "No habit with that id." });

      const inserted = await ctx.db
        .insert(completion)
        .values({
          habitId: input.habitId,
          userId: ctx.userId,
          date: input.date,
          categoryId: h.categoryId,
        })
        .onConflictDoNothing({ target: [completion.habitId, completion.date] })
        .returning({ categoryId: completion.categoryId });
      let categoryId = inserted[0]?.categoryId;
      const alreadyInked = categoryId === undefined;
      if (categoryId === undefined) {
        const existing = await ctx.db
          .select({ categoryId: completion.categoryId })
          .from(completion)
          .where(and(eq(completion.habitId, input.habitId), eq(completion.date, input.date)))
          .limit(1);
        categoryId = existing[0]?.categoryId ?? h.categoryId;
      }
      return {
        inked: true as const,
        alreadyInked,
        habitId: input.habitId,
        date: input.date,
        categoryId: categoryId as CategoryId,
      };
    }),

  unink: protectedProcedure
    .input(z.object({ habitId, date: localDateInput, today: localDateInput }))
    .mutation(async ({ ctx, input }): Promise<{ removed: boolean }> => {
      assertPlausibleToday(input.today, ctx.now());
      assertBackfillable(input.date, input.today);
      const rows = await ctx.db
        .delete(completion)
        .where(
          and(
            eq(completion.habitId, input.habitId),
            eq(completion.date, input.date),
            eq(completion.userId, ctx.userId),
          ),
        )
        .returning({ id: completion.id });
      return { removed: rows.length > 0 };
    }),

  today: protectedProcedure
    .input(z.object({ today: localDateInput }))
    .query(async ({ ctx, input }): Promise<Array<Habit & { inked: boolean }>> => {
      assertPlausibleToday(input.today, ctx.now());
      const [habits, done] = await Promise.all([
        ctx.db
          .select(habitColumns)
          .from(habit)
          .where(and(eq(habit.userId, ctx.userId), isNull(habit.archivedAt)))
          .orderBy(...habitOrderBy),
        ctx.db
          .select({ habitId: completion.habitId })
          .from(completion)
          .where(and(eq(completion.userId, ctx.userId), eq(completion.date, input.today))),
      ]);
      const inked = new Set(done.map((d) => d.habitId));
      return (habits as Habit[]).map((h) => ({ ...h, inked: inked.has(h.id) }));
    }),

  range: protectedProcedure
    .input(z.object({ from: localDateInput, to: localDateInput }))
    .query(async ({ ctx, input }): Promise<Array<{ date: LocalDate; categoryId: CategoryId; habitId: number }>> => {
      if (input.from > input.to) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "The start date must not be after the end date." });
      }
      if (daysBetween(input.from, input.to) > 400) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That range is too long. Ask for 400 days or fewer." });
      }
      const rows = await ctx.db
        .select({ date: completion.date, categoryId: completion.categoryId, habitId: completion.habitId })
        .from(completion)
        .where(
          and(eq(completion.userId, ctx.userId), gte(completion.date, input.from), lte(completion.date, input.to)),
        )
        .orderBy(asc(completion.date), asc(completion.habitId));
      return rows as Array<{ date: LocalDate; categoryId: CategoryId; habitId: number }>;
    }),

  stats: protectedProcedure
    .input(z.object({ today: localDateInput }))
    .query(async ({ ctx, input }): Promise<Stats> => {
      assertPlausibleToday(input.today, ctx.now());
      const [dates, active] = await Promise.all([
        ctx.db.select({ date: completion.date }).from(completion).where(eq(completion.userId, ctx.userId)),
        ctx.db
          .select({ id: habit.id })
          .from(habit)
          .where(and(eq(habit.userId, ctx.userId), isNull(habit.archivedAt))),
      ]);
      return computeStats({
        inkedDates: dates.map((d) => d.date),
        today: input.today,
        activeHabitCount: active.length,
      });
    }),
});
