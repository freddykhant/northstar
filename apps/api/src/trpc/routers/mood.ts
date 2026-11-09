import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { mood } from "../../db/schema.ts";
import { assertBackfillable, assertPlausibleToday, localDateInput } from "../dates.ts";
import { protectedProcedure, router } from "../init.ts";

export const moodRouter = router({
  set: protectedProcedure
    .input(
      z.object({
        date: localDateInput,
        today: localDateInput,
        level: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertPlausibleToday(input.today, ctx.now());
      assertBackfillable(input.date, input.today);
      await ctx.db
        .insert(mood)
        .values({ userId: ctx.userId, date: input.date, level: input.level })
        .onConflictDoUpdate({ target: [mood.userId, mood.date], set: { level: input.level } });
      return { date: input.date, level: input.level };
    }),

  get: protectedProcedure
    .input(z.object({ date: localDateInput }))
    .query(async ({ ctx, input }): Promise<{ date: string; level: number } | null> => {
      const rows = await ctx.db
        .select({ date: mood.date, level: mood.level })
        .from(mood)
        .where(and(eq(mood.userId, ctx.userId), eq(mood.date, input.date)))
        .limit(1);
      return rows[0] ?? null;
    }),
});
