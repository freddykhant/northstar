import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { completions, habits } from "~/server/db/schema";

// Helper function to normalize date to YYYY-MM-DD string
function normalizeDateString(date: string | Date | unknown): string {
  if (typeof date === "string") {
    return date.split("T")[0]!;
  }
  if (date instanceof Date) {
    return date.toISOString().split("T")[0]!;
  }
  return String(date).split("T")[0]!;
}

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
        return {
          ...completion,
          completedDate: normalizeDateString(completion.completedDate),
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
          acc[categoryId] ??= {
            category: completion.habit.category,
            count: 0,
            habits: [],
          };
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

  // get overall statistics (streaks, totals, percentages)
  getOverallStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all completions for this user, ordered by date
    const allCompletions = await ctx.db.query.completions.findMany({
      where: eq(completions.userId, userId),
      orderBy: (completions, { asc }) => [asc(completions.completedDate)],
    });

    // Get all active habits count
    const activeHabits = await ctx.db.query.habits.findMany({
      where: and(eq(habits.userId, userId), eq(habits.isActive, true)),
    });

    const activeHabitsCount = activeHabits.length;

    // Total completed
    const totalCompleted = allCompletions.length;

    if (allCompletions.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        weekPercentage: 0,
      };
    }

    // Group completions by date
    const completionsByDate = new Map<string, number>();
    allCompletions.forEach((completion) => {
      const dateStr = normalizeDateString(completion.completedDate);

      completionsByDate.set(dateStr, (completionsByDate.get(dateStr) ?? 0) + 1);
    });

    // Get unique dates with completions, sorted
    const uniqueDates = Array.from(completionsByDate.keys()).sort();

    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split("T")[0]!;
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0]!;
      if (completionsByDate.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no completions, we check yesterday to allow for ongoing streaks
        if (currentStreak === 0 && dateStr === today) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    // Calculate best streak (longest consecutive days with completions)
    let bestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]!);
      const currDate = new Date(uniqueDates[i]!);

      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    // Calculate week percentage (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]!;

    const weekCompletions = allCompletions.filter((completion) => {
      const dateStr = normalizeDateString(completion.completedDate);
      return dateStr >= sevenDaysAgoStr && dateStr <= today;
    });

    // Week percentage = (completions in last 7 days) / (7 days * active habits) * 100
    const possibleCompletions = 7 * activeHabitsCount;
    const weekPercentage =
      possibleCompletions > 0
        ? Math.round((weekCompletions.length / possibleCompletions) * 100)
        : 0;

    return {
      currentStreak,
      bestStreak,
      totalCompleted,
      weekPercentage,
    };
  }),
});
