import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { resolveCliToken } from "./cli-auth/store.ts";
import type { Db } from "./db/client.ts";
import { appRouter } from "./trpc/root.ts";

export type AppDeps = {
  db: Db;
  auth: {
    handler(req: Request): Promise<Response>;
    getSessionUser(headers: Headers): Promise<{ id: string; name: string; email: string } | null>;
  };
  minCliVersion: string;
  publicUrl: string;
  now?: () => Date;
};

function parseVersion(v: string): number[] | null {
  const parts = v.trim().split(".");
  if (parts.length === 0 || parts.some((p) => !/^\d+$/.test(p))) return null;
  return parts.map(Number);
}

/** True when `version` is lower than `min`. Unparseable `version` counts as older. */
export function isOlderThan(version: string, min: string): boolean {
  const a = parseVersion(version);
  if (!a) return true;
  const b = parseVersion(min) ?? [0];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}

export function createApp(deps: AppDeps): Hono {
  const now = deps.now ?? (() => new Date());
  const app = new Hono();

  app.use("*", async (c, next) => {
    const v = c.req.header("x-squii-version");
    if (v !== undefined && isOlderThan(v, deps.minCliVersion)) {
      return c.json({ error: "upgrade_required", minVersion: deps.minCliVersion }, 426);
    }
    await next();
  });

  app.all("/trpc/*", (c) =>
    fetchRequestHandler({
      endpoint: "/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext: async ({ req }) => {
        const match = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization") ?? "");
        const userId = match?.[1] ? await resolveCliToken(deps.db, match[1], now()) : null;
        return { db: deps.db, userId, now };
      },
    }),
  );

  return app;
}
