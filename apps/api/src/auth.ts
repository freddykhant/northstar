import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Minimal config used only to generate the schema; Task 7 replaces this file.
export const auth = betterAuth({
  database: drizzleAdapter({} as never, { provider: "pg" }),
});
