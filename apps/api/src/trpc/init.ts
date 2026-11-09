import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Db } from "../db/client.ts";

export type Context = { db: Db; userId: string | null; now: () => Date };

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.userId === null) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
