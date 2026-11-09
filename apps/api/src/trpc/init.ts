import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Db } from "../db/client.ts";

export type Context = { db: Db; userId: string | null; now: () => Date };

export const INTERNAL_MESSAGE = "Something went wrong on Squii's side.";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  // Only zod-originated BAD_REQUESTs and internal errors are rewritten; messages
  // a router wrote itself (TRPCError with its own message) are left alone.
  errorFormatter({ shape, error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      return { ...shape, message: INTERNAL_MESSAGE };
    }
    if (error.code === "BAD_REQUEST" && error.cause instanceof ZodError) {
      const first = error.cause.issues[0]?.message;
      if (first) return { ...shape, message: first };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.userId === null) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
