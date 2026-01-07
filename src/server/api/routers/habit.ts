import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { habits } from "~/server/db/schema";
import { db } from "~/server/db";

// helper function to verify habit ownership
async function verifyHabitOwnership(
  database: typeof db,
  habitId: number,
  userId: string,
) {
  const habit = await database.query.habits.findFirst({
    where: eq(habits.id, habitId),
  });

  if (!habit || habit.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not your habit",
    });
  }

  return habit;
}

export const habitRouter = createTRPCRouter({
  // get all habits
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.habits.findMany({
      where: (habits, { eq }) => eq(habits.userId, ctx.session.user.id),
      with: {
        category: true, // include category relation
      },
      orderBy: (habits, { desc }) => [desc(habits.createdAt)],
    });
  }),

  // create habit
  create: protectedProcedure
    .input(
      z.object({
        categoryId: z.enum(["mind", "body", "soul"]),
        name: z.string().min(1).max(256),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .insert(habits)
        .values({
          userId: ctx.session.user.id,
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          isActive: true,
        })
        .returning();
    }),

  // update base
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(256),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyHabitOwnership(ctx.db, input.id, ctx.session.user.id);

      const [updatedHabit] = await ctx.db
        .update(habits)
        .set({
          name: input.name,
          description: input.description,
        })
        .where(eq(habits.id, input.id))
        .returning();

      return updatedHabit;
    }),

  // delete habit
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const habit = await verifyHabitOwnership(
        ctx.db,
        input.id,
        ctx.session.user.id,
      );

      await ctx.db.delete(habits).where(eq(habits.id, input.id));

      return habit;
    }),

  // toggle habit active status
  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const habit = await verifyHabitOwnership(
        ctx.db,
        input.id,
        ctx.session.user.id,
      );

      const [updatedHabit] = await ctx.db
        .update(habits)
        .set({ isActive: !habit.isActive })
        .where(eq(habits.id, input.id))
        .returning();

      return updatedHabit;
    }),
});
