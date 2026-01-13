// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schema";
import { env } from "~/env";

// Only load .env in development
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" }); // or .env.local
}

// Use env validation for DATABASE_URL
const sql = neon(env.DATABASE_URL, {
  // Increase timeout for production
  fetchConnectionCache: true,
});

export const db = drizzle({ client: sql, schema });
export { schema };
