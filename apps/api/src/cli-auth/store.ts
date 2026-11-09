import { and, eq, gt } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import { cliToken } from "../db/schema.ts";
import { sha256Base64Url } from "./crypto.ts";

/** Returns the userId for a live CLI token, or null if unknown or expired. */
export async function resolveCliToken(db: Db, raw: string, now: Date): Promise<string | null> {
  const rows = await db
    .select({ userId: cliToken.userId })
    .from(cliToken)
    .where(and(eq(cliToken.tokenHash, sha256Base64Url(raw)), gt(cliToken.expiresAt, now)))
    .limit(1);
  return rows[0]?.userId ?? null;
}
