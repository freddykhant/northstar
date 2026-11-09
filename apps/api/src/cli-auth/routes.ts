import { Hono } from "hono";
import type { AppDeps } from "../app.ts";
import { cliConfirmPage, cliErrorPage } from "../pages/cli-confirm.ts";
import { cliDonePage } from "../pages/cli-done.ts";
import { user } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { createAuthCode, issueCliToken, redeemAuthCode, revokeCliToken } from "./store.ts";

type Params = { codeChallenge: string; state: string; redirectUri: string };

/** Loopback only: http, 127.0.0.1 or localhost, explicit port, path /callback, nothing else. */
export function validRedirectUri(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "http:") return null;
  if (u.hostname !== "127.0.0.1" && u.hostname !== "localhost") return null;
  const port = Number(u.port);
  if (!/^\d+$/.test(u.port) || port < 1 || port > 65535) return null;
  if (u.pathname !== "/callback") return null;
  if (u.search || u.hash || u.username || u.password) return null;
  return u;
}

function validate(input: {
  code_challenge?: unknown;
  code_challenge_method?: unknown;
  state?: unknown;
  redirect_uri?: unknown;
}): (Params & { redirect: URL }) | null {
  const { code_challenge: ch, code_challenge_method: method, state, redirect_uri: ru } = input;
  if (typeof ch !== "string" || typeof method !== "string") return null;
  if (typeof state !== "string" || typeof ru !== "string") return null;
  if (method !== "S256") return null;
  if (!/^[A-Za-z0-9_-]{43}$/.test(ch)) return null;
  if (state.length < 16 || state.length > 128) return null;
  const redirect = validRedirectUri(ru);
  if (!redirect) return null;
  return { codeChallenge: ch, state, redirectUri: redirect.href, redirect };
}

const BAD_REQUEST = "That sign-in link doesn't look right. Run squii login again to get a fresh one.";

export function cliRoutes(deps: AppDeps): Hono {
  const now = deps.now ?? (() => new Date());
  const app = new Hono();

  app.get("/authorize", async (c) => {
    const q = c.req.query();
    const p = validate(q);
    if (!p) return c.html(cliErrorPage(BAD_REQUEST), 400);
    const sessionUser = await deps.auth.getSessionUser(c.req.raw.headers);
    if (!sessionUser) {
      const url = new URL(c.req.url);
      return c.redirect(`/signin?next=${encodeURIComponent(url.pathname + url.search)}`, 302);
    }
    return c.html(cliConfirmPage(sessionUser.name, p), 200, {
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'",
    });
  });

  app.post("/authorize", async (c) => {
    const origin = c.req.header("origin");
    if (origin !== undefined && origin !== new URL(deps.publicUrl).origin) {
      return c.html(cliErrorPage("That request came from somewhere unexpected. Run `squii login` again."), 403);
    }
    let body: Record<string, unknown>;
    try {
      body = await c.req.parseBody();
    } catch {
      return c.html(cliErrorPage(BAD_REQUEST), 400);
    }
    const p = validate(body);
    if (!p) return c.html(cliErrorPage(BAD_REQUEST), 400);
    const sessionUser = await deps.auth.getSessionUser(c.req.raw.headers);
    if (!sessionUser) {
      const next = "/cli/authorize?" + new URLSearchParams({
        code_challenge: p.codeChallenge,
        code_challenge_method: "S256",
        state: p.state,
        redirect_uri: p.redirectUri,
      }).toString();
      return c.redirect(`/signin?next=${encodeURIComponent(next)}`, 302);
    }
    const code = await createAuthCode(deps.db, sessionUser.id, p.codeChallenge, now());
    const target = new URL(p.redirectUri);
    target.searchParams.set("code", code);
    target.searchParams.set("state", p.state);
    return c.redirect(target.toString(), 302);
  });

  app.post("/token", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "invalid_request" }, 400);
    }
    const b = body as { code?: unknown; code_verifier?: unknown } | null;
    if (!b || typeof b.code !== "string" || typeof b.code_verifier !== "string") {
      return c.json({ error: "invalid_request" }, 400);
    }
    const t = now();
    const userId = await redeemAuthCode(deps.db, b.code, b.code_verifier, t);
    if (!userId) return c.json({ error: "invalid_grant" }, 400);
    const rows = await deps.db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    const u = rows[0];
    if (!u) return c.json({ error: "invalid_grant" }, 400);
    const token = await issueCliToken(deps.db, userId, t);
    return c.json({ token, user: { name: u.name, email: u.email } });
  });

  app.post("/revoke", async (c) => {
    const match = /^Bearer\s+(\S+)$/i.exec(c.req.header("authorization") ?? "");
    if (match?.[1]) await revokeCliToken(deps.db, match[1]);
    return c.body(null, 204);
  });

  app.get("/done", (c) => c.html(cliDonePage()));

  return app;
}
