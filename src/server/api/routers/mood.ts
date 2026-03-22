import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { moods } from "~/server/db/schema";

export const moodRouter = createTRPCRouter({
  // create or update mood for a specific date
  set: protectedProcedure
    .input(
      z.object({
        level: z.number().int().min(1).max(5),
        date: z.string(), // YYYY-MM-DD format
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { level, date } = input;
      const userId = ctx.session.user.id;

      // Atomic upsert — avoids race condition between check and insert
      const [upsertedMood] = await ctx.db
        .insert(moods)
        .values({ userId, level, moodDate: date })
        .onConflictDoUpdate({
          target: [moods.userId, moods.moodDate],
          set: { level },
        })
        .returning();

      return upsertedMood;
    }),

  // get mood for a specific date
  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { date } = input;

      const mood = await ctx.db.query.moods.findFirst({
        where: and(eq(moods.userId, userId), eq(moods.moodDate, date)),
      });

      return mood ?? null;
    }),

  // get moods for a date range
  getRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { startDate, endDate } = input;

      const moodList = await ctx.db.query.moods.findMany({
        where: and(
          eq(moods.userId, userId),
          gte(moods.moodDate, startDate),
          lte(moods.moodDate, endDate),
        ),
        orderBy: (moods, { asc }) => [asc(moods.moodDate)],
      });

      return moodList;
    }),

  // get all moods for current year
  getYearMoods: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    const moodList = await ctx.db.query.moods.findMany({
      where: and(
        eq(moods.userId, userId),
        gte(moods.moodDate, startDate),
        lte(moods.moodDate, endDate),
      ),
      orderBy: (moods, { asc }) => [asc(moods.moodDate)],
    });

    return moodList;
  }),

  // delete mood for a specific date
  delete: protectedProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { date } = input;

      const existingMood = await ctx.db.query.moods.findFirst({
        where: and(eq(moods.userId, userId), eq(moods.moodDate, date)),
      });

      if (!existingMood) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mood not found" });
      }

      await ctx.db.delete(moods).where(eq(moods.id, existingMood.id));

      return { success: true, date };
    }),
});
