import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habits } from "~/server/db/schema";

export const habitRouter = createTRPCRouter({
  // get all habits
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.habits.findMany({
      where: eq(habits.userId, ctx.session.user.id),
      orderBy: [desc(habits.createdAt)],
    });
  }),
});
