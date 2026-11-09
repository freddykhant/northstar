import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema.ts";

/**
 * Shared drizzle database type. The production driver (neon-http) has no
 * interactive transactions, so never call `db.transaction(...)` even though
 * the type allows it (PGlite in tests would accept it and hide the bug).
 * Write each operation as a single atomic statement instead, e.g.
 * `DELETE ... RETURNING` or `INSERT ... ON CONFLICT`.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export function createDb(url: string): Db {
  return drizzle(neon(url), { schema }) as Db; // driver-specific HKT narrowed to the shared base
}
