import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@squii/api/router";
import superjson from "superjson";
import { UpgradeRequiredError } from "./errors.ts";
import { VERSION } from "../version.ts";

export function createApiClient(opts: { baseUrl: string; token?: string }): TRPCClient<AppRouter> {
  const baseUrl = opts.baseUrl.replace(/\/+$/, "");
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        transformer: superjson,
        headers: () => ({
          ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
          "x-squii-version": VERSION,
        }),
        async fetch(input, init) {
          const res = await fetch(input, init);
          if (res.status === 426) {
            let minVersion = "latest";
            try {
              const body = (await res.json()) as { minVersion?: unknown };
              if (typeof body.minVersion === "string") minVersion = body.minVersion;
            } catch {
              // fall through with the generic label
            }
            throw new UpgradeRequiredError(minVersion);
          }
          return res;
        },
      }),
    ],
  });
}
