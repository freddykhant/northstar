import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createPkcePair } from "../src/auth/pkce.ts";

describe("createPkcePair", () => {
  it("verifier is 43 base64url chars and challenge is its S256", () => {
    const { verifier, challenge } = createPkcePair();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(challenge).toBe(createHash("sha256").update(verifier).digest("base64url"));
    expect(createPkcePair().verifier).not.toBe(verifier);
  });
});
