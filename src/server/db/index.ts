// src/db.ts
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "~/env";

config({ path: ".env" }); // or .env.local

const sql = neon(env.STORAGE_DATABASE_URL!);
export const db = drizzle({ client: sql });
