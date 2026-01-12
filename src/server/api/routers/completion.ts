import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { completions, habits } from "~/server/db/schema";

export const completionRouter = createTRPCRouter({
  // toggle completion for a habit on a specific date
  toggle: protectedProcedure
    .input(
      z.object({
        habitId: z.number(),
        date: z.string(), // ISO date string (YYYY-MM-DD)
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { habitId, date } = input;
      const userId = ctx.session.user.id;

      // user verification
      const habit = await ctx.db.query.habits.findFirst({
        where: and(eq(habits.id, habitId), eq(habits.userId, userId)),
      });

      if (!habit) {
        throw new Error("Habit not found or does not belong to you");
      }

      // check if completion already exists
      const existingCompletion = await ctx.db.query.completions.findFirst({
        where: and(
          eq(completions.habitId, habitId),
          eq(completions.completedDate, date),
          eq(completions.userId, userId),
        ),
      });

      if (existingCompletion) {
        // delete (uncomplete)
        await ctx.db
          .delete(completions)
          .where(eq(completions.id, existingCompletion.id));

        return { completed: false, habitId, date };
      } else {
        // create (complete)
        const [newCompletion] = await ctx.db
          .insert(completions)
          .values({
            habitId,
            userId,
            completedDate: date,
          })
          .returning();

        return { completed: true, habitId, date, completion: newCompletion };
      }
    }),

  // get all completions for a date range (for contribution graph)
  getMyCompletions: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO date string (YYYY-MM-DD)
        endDate: z.string(), // ISO date string (YYYY-MM-DD)
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { startDate, endDate } = input;

      const result = await ctx.db.query.completions.findMany({
        where: and(
          eq(completions.userId, userId),
          gte(completions.completedDate, startDate),
          lte(completions.completedDate, endDate),
        ),
        with: {
          habit: {
            with: {
              category: true,
            },
          },
        },
        orderBy: (completions, { desc }) => [desc(completions.completedDate)],
      });

      // Format dates to ensure they're strings in YYYY-MM-DD format
      return result.map((completion) => {
        const date = completion.completedDate as unknown;
        const dateStr =
          typeof date === "string"
            ? date
            : date instanceof Date
              ? date.toISOString().split("T")[0]!
              : String(date).split("T")[0]!;

        return {
          ...completion,
          completedDate: dateStr,
        };
      });
    }),

  // get stats for a specific date (grouped by category)
  getStatsForDate: protectedProcedure
    .input(
      z.object({
        date: z.string(), // ISO date string (YYYY-MM-DD)
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { date } = input;

      // get all completions for this date with habit and category info
      const completionsForDate = await ctx.db.query.completions.findMany({
        where: and(
          eq(completions.userId, userId),
          eq(completions.completedDate, date),
        ),
        with: {
          habit: {
            with: {
              category: true,
            },
          },
        },
      });

      // group by category
      const stats = completionsForDate.reduce(
        (acc, completion) => {
          const categoryId = completion.habit.category.id;
          if (!acc[categoryId]) {
            acc[categoryId] = {
              category: completion.habit.category,
              count: 0,
              habits: [],
            };
          }
          acc[categoryId].count++;
          acc[categoryId].habits.push(completion.habit);
          return acc;
        },
        {} as Record<
          string,
          {
            category: { id: string; name: string; color: string };
            count: number;
            habits: Array<{ id: number; name: string }>;
          }
        >,
      );

      return {
        date,
        totalCompletions: completionsForDate.length,
        byCategory: Object.values(stats),
      };
    }),

  // get completion status for user's active habits on a specific date
  getForDate: protectedProcedure
    .input(
      z.object({
        date: z.string(), // ISO date string (YYYY-MM-DD)
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { date } = input;

      // Get all active habits
      const userHabits = await ctx.db.query.habits.findMany({
        where: and(eq(habits.userId, userId), eq(habits.isActive, true)),
        with: {
          category: true,
        },
        orderBy: (habits, { desc }) => [desc(habits.createdAt)],
      });

      // get completions for this date
      const completionsForDate = await ctx.db.query.completions.findMany({
        where: and(
          eq(completions.userId, userId),
          eq(completions.completedDate, date),
        ),
      });

      // map completions to habit IDs
      const completedHabitIds = new Set(
        completionsForDate.map((c) => c.habitId),
      );

      // return habits with completion status
      return userHabits.map((habit) => ({
        ...habit,
        isCompleted: completedHabitIds.has(habit.id),
      }));
    }),
});
