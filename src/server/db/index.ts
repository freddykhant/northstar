import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "~/env";
import * as schema from "./schema";

config({ path: ".env" });

const sql = neon(env.STORAGE_DATABASE_URL);
export const db = drizzle({ client: sql, schema });
export { schema };
