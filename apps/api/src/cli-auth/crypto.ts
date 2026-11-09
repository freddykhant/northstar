import { createHash, randomBytes } from "node:crypto";

export function sha256Base64Url(s: string): string {
  return createHash("sha256").update(s).digest("base64url");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
