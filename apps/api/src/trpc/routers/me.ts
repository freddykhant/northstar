import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { user } from "../../db/schema.ts";
import { protectedProcedure, router } from "../init.ts";

export const meRouter = router({
  whoami: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, ctx.userId))
      .limit(1);
    const row = rows[0];
    if (!row) throw new TRPCError({ code: "UNAUTHORIZED" });
    return row;
  }),
});
