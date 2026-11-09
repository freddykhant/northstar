import { TRPCClientError } from "@trpc/client";
import { describe, expect, it } from "vitest";
import { SquiiError, toFriendlyMessage, UpgradeRequiredError } from "../src/api/errors.ts";

function trpcError(code: string, message = "m", cause?: Error) {
  return Object.assign(new TRPCClientError(message, { cause }), { data: { code } });
}
function fetchFailed(code: string) {
  return new TypeError("fetch failed", { cause: Object.assign(new Error("x"), { code }) });
}

const out = { signedIn: false };
const inn = { signedIn: true };

describe("toFriendlyMessage", () => {
  it("handles unauthorized", () => {
    expect(toFriendlyMessage(trpcError("UNAUTHORIZED"), out)).toBe(
      "You're not signed in yet. Run `squii login`.",
    );
    expect(toFriendlyMessage(trpcError("UNAUTHORIZED"), inn)).toBe(
      "You've been signed out. Run `squii login`.",
    );
  });

  it("handles offline", () => {
    for (const code of ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT"]) {
      expect(toFriendlyMessage(fetchFailed(code), inn)).toBe(
        "Squii can't reach the internet right now.",
      );
    }
    expect(toFriendlyMessage(trpcError("INTERNAL_SERVER_ERROR", "m", fetchFailed("ENOTFOUND")), inn)).toBe(
      "Squii can't reach the internet right now.",
    );
  });

  it("handles upgrade required", () => {
    const msg = "A newer Squii is out (0.2.0). Run `npm i -g squii@latest`.";
    expect(toFriendlyMessage(new UpgradeRequiredError("0.2.0"), inn)).toBe(msg);
    expect(
      toFriendlyMessage(trpcError("INTERNAL_SERVER_ERROR", "m", new UpgradeRequiredError("0.2.0")), inn),
    ).toBe(msg);
  });

  it("passes SquiiError through", () => {
    expect(toFriendlyMessage(new SquiiError("x"), inn)).toBe("x");
  });

  it("passes user-facing server messages through", () => {
    for (const code of ["CONFLICT", "BAD_REQUEST", "NOT_FOUND"]) {
      expect(toFriendlyMessage(trpcError(code, "No habit with that id."), inn)).toBe(
        "No habit with that id.",
      );
    }
  });

  it("falls back for anything else", () => {
    const fallback = "Something went wrong on Squii's side. Try again in a moment.";
    expect(toFriendlyMessage(trpcError("INTERNAL_SERVER_ERROR", "boom"), inn)).toBe(fallback);
    expect(toFriendlyMessage(new Error("boom"), inn)).toBe(fallback);
    expect(toFriendlyMessage("weird", inn)).toBe(fallback);
  });
});
