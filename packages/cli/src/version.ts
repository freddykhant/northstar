declare const __SQUII_VERSION__: string;

/** Injected at build time (tsup `define`) and in tests (vitest `define`). */
export const VERSION: string = __SQUII_VERSION__;

export function apiUrl(): string {
  const fromEnv = process.env.SQUII_API_URL?.trim().replace(/\/+$/, "");
  return fromEnv || "https://northstar-one.vercel.app";
}
