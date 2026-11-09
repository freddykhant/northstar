import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AppDeps } from "./app.ts";
import type { Db } from "./db/client.ts";
import * as authSchema from "./db/auth-schema.ts";
import type { Env } from "./env.ts";

export function createAuth(db: Db, env: Env): AppDeps["auth"] {
  const auth = betterAuth({
    // neon-http has no interactive transactions, so the adapter must not open any.
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema, transaction: false }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
      github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
    },
  });

  return {
    handler: (req) => auth.handler(req),
    async getSessionUser(headers) {
      const session = await auth.api.getSession({ headers });
      if (!session) return null;
      const { id, name, email } = session.user;
      return { id, name, email };
    },
  };
}
