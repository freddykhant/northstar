import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // create new user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          name: `${input.firstName} ${input.lastName}`,
        })
        .returning();

      return {
        success: true,
        userId: newUser?.id,
      };
    }),
});
