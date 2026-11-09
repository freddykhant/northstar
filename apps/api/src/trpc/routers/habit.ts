import { CATEGORY_IDS, type CategoryId } from "@squii/core";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { habit } from "../../db/schema.ts";
import type { Db } from "../../db/client.ts";
import { protectedProcedure, router } from "../init.ts";

export type Habit = {
  id: number;
  name: string;
  categoryId: CategoryId;
  archivedAt: Date | null;
  createdAt: Date;
};

export const habitColumns = {
  id: habit.id,
  name: habit.name,
  categoryId: habit.categoryId,
  archivedAt: habit.archivedAt,
  createdAt: habit.createdAt,
};

const categoryRank = sql.raw(
  `case ${habit.categoryId.name} ${CATEGORY_IDS.map((c, i) => `when '${c}' then ${i}`).join(" ")} end`,
);

/** Canonical habit list ordering: mind, body, soul, then oldest first. */
export const habitOrderBy = [asc(categoryRank), asc(habit.createdAt), asc(habit.id)] as const;

const nameSchema = z
  .string()
  .transform((s) => s.trim().replace(/\s+/g, " "))
  .pipe(z.string().min(1).max(80));

const categorySchema = z.enum(CATEGORY_IDS);

function pgCode(err: unknown): unknown {
  const e = err as { code?: unknown; cause?: { code?: unknown } } | null;
  return e?.code ?? e?.cause?.code;
}

const notFound = () => new TRPCError({ code: "NOT_FOUND", message: "No habit with that id." });

async function conflictFor(
  db: Db,
  userId: string,
  name: string,
): Promise<TRPCError> {
  const rows = await db
    .select({ name: habit.name })
    .from(habit)
    .where(
      and(eq(habit.userId, userId), isNull(habit.archivedAt), sql`lower(${habit.name}) = ${name.toLowerCase()}`),
    )
    .limit(1);
  const existing = rows[0]?.name ?? name;
  return new TRPCError({
    code: "CONFLICT",
    message: `You already have a habit called '${existing}'.`,
  });
}

export const habitRouter = router({
  list: protectedProcedure
    .input(z.object({ includeArchived: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }): Promise<Habit[]> => {
      const where = input?.includeArchived
        ? eq(habit.userId, ctx.userId)
        : and(eq(habit.userId, ctx.userId), isNull(habit.archivedAt));
      const rows = await ctx.db
        .select(habitColumns)
        .from(habit)
        .where(where)
        .orderBy(...habitOrderBy);
      return rows as Habit[];
    }),

  create: protectedProcedure
    .input(z.object({ name: nameSchema, categoryId: categorySchema }))
    .mutation(async ({ ctx, input }): Promise<Habit> => {
      try {
        const rows = await ctx.db
          .insert(habit)
          .values({ userId: ctx.userId, name: input.name, categoryId: input.categoryId })
          .returning(habitColumns);
        return rows[0] as Habit;
      } catch (err) {
        if (pgCode(err) === "23505") throw await conflictFor(ctx.db, ctx.userId, input.name);
        throw err;
      }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number().int(), name: nameSchema.optional(), categoryId: categorySchema.optional() }))
    .mutation(async ({ ctx, input }): Promise<Habit> => {
      const active = and(
        eq(habit.id, input.id),
        eq(habit.userId, ctx.userId),
        isNull(habit.archivedAt),
      );
      if (input.name === undefined && input.categoryId === undefined) {
        const rows = await ctx.db.select(habitColumns).from(habit).where(active).limit(1);
        if (!rows[0]) throw notFound();
        return rows[0] as Habit;
      }
      try {
        const rows = await ctx.db
          .update(habit)
          .set({
            ...(input.name !== undefined && { name: input.name }),
            ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
            updatedAt: ctx.now(),
          })
          .where(active)
          .returning(habitColumns);
        if (!rows[0]) throw notFound();
        return rows[0] as Habit;
      } catch (err) {
        if (pgCode(err) === "23505" && input.name !== undefined) {
          throw await conflictFor(ctx.db, ctx.userId, input.name);
        }
        throw err;
      }
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }): Promise<Habit> => {
      const now = ctx.now();
      const rows = await ctx.db
        .update(habit)
        .set({ archivedAt: now, updatedAt: now })
        .where(and(eq(habit.id, input.id), eq(habit.userId, ctx.userId), isNull(habit.archivedAt)))
        .returning(habitColumns);
      if (!rows[0]) throw notFound();
      return rows[0] as Habit;
    }),
});
