import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256Base64Url(s: string): string {
  return createHash("sha256").update(s).digest("base64url");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** PKCE S256: base64url(sha256(verifier)) must equal the challenge (constant-time compare). */
export function verifyPkce(verifier: string, challenge: string): boolean {
  const a = Buffer.from(sha256Base64Url(verifier));
  const b = Buffer.from(challenge);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
