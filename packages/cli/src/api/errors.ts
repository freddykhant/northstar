import { TRPCClientError } from "@trpc/client";

/** An error whose message is already written for the user. */
export class SquiiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SquiiError";
  }
}

export class UpgradeRequiredError extends Error {
  readonly minVersion: string;
  constructor(minVersion: string) {
    super(`Squii ${minVersion} or newer is required.`);
    this.name = "UpgradeRequiredError";
    this.minVersion = minVersion;
  }
}

const OFFLINE_CODES = new Set([
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
]);

function isOffline(err: unknown): boolean {
  if (err instanceof TypeError && err.message === "fetch failed") {
    const code = (err.cause as { code?: unknown } | undefined)?.code;
    return typeof code === "string" && OFFLINE_CODES.has(code);
  }
  if (err instanceof TRPCClientError && err.cause) return isOffline(err.cause);
  return false;
}

const PASSTHROUGH = new Set(["CONFLICT", "BAD_REQUEST", "NOT_FOUND"]);

export function toFriendlyMessage(err: unknown, ctx: { signedIn: boolean }): string {
  if (err instanceof SquiiError) return err.message;
  if (err instanceof UpgradeRequiredError) return upgradeMessage(err);
  if (err instanceof TRPCClientError && err.cause instanceof UpgradeRequiredError) {
    return upgradeMessage(err.cause);
  }
  if (isOffline(err)) return "Squii can't reach the internet right now.";
  if (err instanceof TRPCClientError) {
    const code = (err.data as { code?: unknown } | null | undefined)?.code;
    if (code === "UNAUTHORIZED") {
      return ctx.signedIn
        ? "You've been signed out. Run `squii login`."
        : "You're not signed in yet. Run `squii login`.";
    }
    if (code === "NOT_FOUND" && err.message.startsWith("No procedure found")) {
        return "Something went wrong on Squii's side. Try again in a moment.";
      }
      if (typeof code === "string" && PASSTHROUGH.has(code)) return err.message;
  }
  return "Something went wrong on Squii's side. Try again in a moment.";
}

function upgradeMessage(err: UpgradeRequiredError): string {
  return `A newer Squii is out (${err.minVersion}). Run \`npm i -g squii@latest\`.`;
}
