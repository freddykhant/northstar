import { and, eq, gt, lt } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import { cliAuthCode, cliToken } from "../db/schema.ts";
import { randomToken, sha256Base64Url, verifyPkce } from "./crypto.ts";

const DAY_MS = 86_400_000;
const AUTH_CODE_TTL_MS = 60_000;
const TOKEN_TTL_MS = 180 * DAY_MS;

/** Stores a single-use auth code (hashed) bound to the PKCE challenge; returns the raw code. */
export async function createAuthCode(
  db: Db,
  userId: string,
  challenge: string,
  now: Date,
): Promise<string> {
  const code = randomToken();
  await db.insert(cliAuthCode).values({
    codeHash: sha256Base64Url(code),
    userId,
    codeChallenge: challenge,
    expiresAt: new Date(now.getTime() + AUTH_CODE_TTL_MS),
  });
  return code;
}

/**
 * Burns the code in one DELETE ... RETURNING (single-use even on failure), then checks
 * expiry and the PKCE verifier. Returns the userId or null.
 */
export async function redeemAuthCode(
  db: Db,
  code: string,
  verifier: string,
  now: Date,
): Promise<string | null> {
  const rows = await db
    .delete(cliAuthCode)
    .where(eq(cliAuthCode.codeHash, sha256Base64Url(code)))
    .returning();
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() <= now.getTime()) return null;
  if (!verifyPkce(verifier, row.codeChallenge)) return null;
  return row.userId;
}

export async function issueCliToken(db: Db, userId: string, now: Date): Promise<string> {
  const raw = `sq_${randomToken()}`;
  await db.insert(cliToken).values({
    userId,
    tokenHash: sha256Base64Url(raw),
    createdAt: now,
    lastUsedAt: now,
    expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
  });
  return raw;
}

/** Returns the userId for a live CLI token, or null. Slides expiry if last used over a day ago. */
export async function resolveCliToken(db: Db, raw: string, now: Date): Promise<string | null> {
  const rows = await db
    .select({ id: cliToken.id, userId: cliToken.userId, lastUsedAt: cliToken.lastUsedAt })
    .from(cliToken)
    .where(and(eq(cliToken.tokenHash, sha256Base64Url(raw)), gt(cliToken.expiresAt, now)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.lastUsedAt.getTime() < now.getTime() - DAY_MS) {
    await db
      .update(cliToken)
      .set({ expiresAt: new Date(now.getTime() + TOKEN_TTL_MS), lastUsedAt: now })
      .where(and(eq(cliToken.id, row.id), lt(cliToken.lastUsedAt, new Date(now.getTime() - DAY_MS))));
  }
  return row.userId;
}

export async function revokeCliToken(db: Db, raw: string): Promise<void> {
  await db.delete(cliToken).where(eq(cliToken.tokenHash, sha256Base64Url(raw)));
}
