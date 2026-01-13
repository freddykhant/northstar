import bcrypt from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // properly validate and type the credentials
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          return null;
        }

        // find user by email
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email),
        });

        if (!user?.password) {
          return null;
        }

        // verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name,
          image: user.image,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  // Note: No adapter needed for JWT sessions
  // Database is only queried during login (in authorize function)
  // Google OAuth will store account in database via callbacks
  session: {
    strategy: "jwt", // JWT tokens instead of database sessions
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // For Google OAuth, create/update user in database
        if (account?.provider === "google" && user.email) {
          const { schema } = await import("~/server/db");
          // Check if user exists
          const existingUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, user.email!),
          });
          
          if (!existingUser) {
            // Create new user
            const [newUser] = await db
              .insert(schema.users)
              .values({
                email: user.email!,
                name: user.name ?? null,
                image: user.image ?? null,
              })
              .returning();
            token.id = newUser!.id;
          } else {
            token.id = existingUser.id;
          }
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
} satisfies NextAuthConfig;
