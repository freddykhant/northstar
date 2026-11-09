import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.ts";
import { sha256Base64Url, verifyPkce } from "../src/cli-auth/crypto.ts";
import { issueCliToken, resolveCliToken } from "../src/cli-auth/store.ts";
import type { Db } from "../src/db/client.ts";
import { cliAuthCode, cliToken } from "../src/db/schema.ts";
import { createTestDb } from "./db.ts";
import { seedUser } from "./fixtures.ts";

const VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
const STATE = "abcdefghijklmnop1234";
const REDIRECT = "http://127.0.0.1:53682/callback";
const T0 = new Date("2026-01-01T00:00:00Z");

let db: Db;
let clock: Date;
beforeEach(async () => {
  db = await createTestDb();
  clock = T0;
});

function appWith() {
  return createApp({
    db,
    auth: {
      handler: async () => new Response("unused"),
      getSessionUser: async (h) => {
        const id = h.get("x-test-user");
        if (!id) return null;
        const { user } = await import("../src/db/schema.ts");
        const rows = await db.select().from(user).where(eq(user.id, id));
        return rows[0] ? { id, name: rows[0].name, email: rows[0].email } : null;
      },
    },
    minCliVersion: "0.0.0",
    publicUrl: "https://squii.test",
    now: () => clock,
  });
}

function qs(over: Record<string, string> = {}) {
  return new URLSearchParams({
    code_challenge: CHALLENGE,
    code_challenge_method: "S256",
    state: STATE,
    redirect_uri: REDIRECT,
    ...over,
  });
}

function postAuthorize(app: ReturnType<typeof appWith>, userId: string | null, over = {}, headers = {}) {
  return app.request("/cli/authorize", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...(userId ? { "x-test-user": userId } : {}),
      ...headers,
    },
    body: qs(over).toString(),
  });
}

async function getCode(app: ReturnType<typeof appWith>, userId: string) {
  const res = await postAuthorize(app, userId);
  return new URL(res.headers.get("location") as string).searchParams.get("code") as string;
}

function tokenReq(app: ReturnType<typeof appWith>, body: unknown) {
  return app.request("/cli/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("verifyPkce", () => {
  it("matches the RFC 7636 Appendix B example", () => {
    expect(verifyPkce(VERIFIER, CHALLENGE)).toBe(true);
    expect(verifyPkce(VERIFIER.slice(0, -1) + "l", CHALLENGE)).toBe(false);
    expect(verifyPkce("short", CHALLENGE)).toBe(false);
    expect(verifyPkce(VERIFIER, "x")).toBe(false);
  });
});

describe("GET /cli/authorize", () => {
  it("without a session redirects to signin with next", async () => {
    const res = await appWith().request(`/cli/authorize?${qs()}`);
    expect(res.status).toBe(302);
    const loc = res.headers.get("location") as string;
    expect(loc.startsWith("/signin?next=")).toBe(true);
    expect(decodeURIComponent(loc.slice("/signin?next=".length))).toBe(`/cli/authorize?${qs()}`);
  });

  it("rejects a non-loopback redirect_uri", async () => {
    const res = await appWith().request(`/cli/authorize?${qs({ redirect_uri: "https://evil.example/callback" })}`);
    expect(res.status).toBe(400);
  });

  it.each([
    "http://127.0.0.1:53682/other",
    "http://127.0.0.1/callback",
    "http://127.0.0.1:53682/callback?x=1",
    "http://127.0.0.1:53682/callback#h",
    "http://user:pw@127.0.0.1:53682/callback",
    "http://127.0.0.1.evil.example:53682/callback",
    "http://127.0.0.1:0/callback",
    "https://127.0.0.1:53682/callback",
    "http://127.0.0.1:53682/callback/",
  ])("rejects redirect_uri %s", async (uri) => {
    const res = await appWith().request(`/cli/authorize?${qs({ redirect_uri: uri })}`, {
      headers: { "x-test-user": (await seedUser(db)).id },
    });
    expect(res.status).toBe(400);
  });

  it("accepts localhost", async () => {
    const u = await seedUser(db);
    const res = await appWith().request(
      `/cli/authorize?${qs({ redirect_uri: "http://localhost:4000/callback" })}`,
      { headers: { "x-test-user": u.id } },
    );
    expect(res.status).toBe(200);
  });

  it("rejects plain method, bad challenge and short state", async () => {
    const a = appWith();
    const cases: Record<string, string>[] = [
      { code_challenge_method: "plain" },
      { code_challenge: "short" },
      { state: "tooshort" },
    ];
    for (const over of cases) {
      expect((await a.request(`/cli/authorize?${qs(over)}`)).status).toBe(400);
    }
  });

  it("renders the confirm page, escaped and unframeable", async () => {
    const u = await seedUser(db, { name: "<b>Eve</b>" });
    const res = await appWith().request(`/cli/authorize?${qs()}`, { headers: { "x-test-user": u.id } });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("content-security-policy")).toBe("frame-ancestors 'none'");
    const body = await res.text();
    expect(body).toContain("&lt;b&gt;Eve&lt;/b&gt;");
    expect(body).not.toContain("<b>Eve");
    expect(body).toContain("Continue");
    expect(body).toContain(`value="${REDIRECT}"`);
  });
});

describe("POST /cli/authorize", () => {
  it("redirects to the loopback with code and state", async () => {
    const u = await seedUser(db);
    const res = await postAuthorize(appWith(), u.id, {}, { origin: "https://squii.test" });
    expect(res.status).toBe(302);
    const loc = new URL(res.headers.get("location") as string);
    expect(loc.origin + loc.pathname).toBe(REDIRECT);
    expect(loc.searchParams.get("state")).toBe(STATE);
    expect(loc.searchParams.get("code")).toBeTruthy();
  });

  it("without a session redirects to signin", async () => {
    const res = await postAuthorize(appWith(), null);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/^\/signin\?next=/);
    expect(await db.select().from(cliAuthCode)).toHaveLength(0);
  });

  it("rejects a foreign Origin with 403 and issues nothing", async () => {
    const u = await seedUser(db);
    const res = await postAuthorize(appWith(), u.id, {}, { origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("Run `squii login` again.");
    expect(await db.select().from(cliAuthCode)).toHaveLength(0);
  });

  it("re-validates params and rejects a non-/callback path", async () => {
    const u = await seedUser(db);
    const res = await postAuthorize(appWith(), u.id, { redirect_uri: "http://127.0.0.1:53682/evil" });
    expect(res.status).toBe(400);
    expect(await db.select().from(cliAuthCode)).toHaveLength(0);
  });
});

describe("POST /cli/token", () => {
  it("succeeds once, then invalid_grant", async () => {
    const u = await seedUser(db);
    const a = appWith();
    const code = await getCode(a, u.id);
    const ok = await tokenReq(a, { code, code_verifier: VERIFIER });
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { token: string; user: { name: string; email: string } };
    expect(body.token.startsWith("sq_")).toBe(true);
    expect(body.user).toEqual({ name: u.name, email: u.email });
    const again = await tokenReq(a, { code, code_verifier: VERIFIER });
    expect(again.status).toBe(400);
    expect(await again.json()).toEqual({ error: "invalid_grant" });
  });

  it("fails with the wrong verifier and burns the code", async () => {
    const u = await seedUser(db);
    const a = appWith();
    const code = await getCode(a, u.id);
    const bad = await tokenReq(a, { code, code_verifier: "x".repeat(43) });
    expect(await bad.json()).toEqual({ error: "invalid_grant" });
    const good = await tokenReq(a, { code, code_verifier: VERIFIER });
    expect(good.status).toBe(400);
    expect(await good.json()).toEqual({ error: "invalid_grant" });
  });

  it("fails after 60 seconds", async () => {
    const u = await seedUser(db);
    const a = appWith();
    const code = await getCode(a, u.id);
    clock = new Date(T0.getTime() + 61_000);
    const res = await tokenReq(a, { code, code_verifier: VERIFIER });
    expect(await res.json()).toEqual({ error: "invalid_grant" });
  });

  it("rejects malformed bodies with invalid_request", async () => {
    const a = appWith();
    for (const body of ["not json", "null", {}, { code: 1, code_verifier: "x" }, { code: "x" }]) {
      const res = await tokenReq(a, body);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid_request" });
    }
  });
});

describe("tokens", () => {
  it("issued token works for whoami, and revoke ends it", async () => {
    const u = await seedUser(db);
    const a = appWith();
    const code = await getCode(a, u.id);
    const { token } = (await (await tokenReq(a, { code, code_verifier: VERIFIER })).json()) as { token: string };
    const who = () => a.request("/trpc/me.whoami", { headers: { authorization: `Bearer ${token}` } });
    expect((await who()).status).toBe(200);
    const rev = await a.request("/cli/revoke", { method: "POST", headers: { authorization: `Bearer ${token}` } });
    expect(rev.status).toBe(204);
    expect((await who()).status).toBe(401);
  });

  it("revoke returns 204 for unknown, missing and malformed tokens", async () => {
    const a = appWith();
    for (const headers of [{ authorization: "Bearer sq_nope" }, {} as Record<string, string>, { authorization: "Basic abc" }]) {
      expect((await a.request("/cli/revoke", { method: "POST", headers })).status).toBe(204);
    }
  });

  it("stores only a hash of the token", async () => {
    const u = await seedUser(db);
    const raw = await issueCliToken(db, u.id, T0);
    const rows = await db.select().from(cliToken);
    expect(rows[0]?.tokenHash).toBe(sha256Base64Url(raw));
    expect(rows[0]?.tokenHash).not.toBe(raw);
  });

  it("slides its expiry when used after a day", async () => {
    const u = await seedUser(db);
    const raw = await issueCliToken(db, u.id, T0);
    const day = 86_400_000;
    const t2 = new Date(T0.getTime() + 2 * day);
    expect(await resolveCliToken(db, raw, t2)).toBe(u.id);
    const [row] = await db.select().from(cliToken);
    expect(row?.expiresAt.getTime()).toBe(t2.getTime() + 180 * day);
    expect(row?.lastUsedAt.getTime()).toBe(t2.getTime());
  });

  it("does not slide when used within a day", async () => {
    const u = await seedUser(db);
    const raw = await issueCliToken(db, u.id, T0);
    await resolveCliToken(db, raw, new Date(T0.getTime() + 3_600_000));
    const [row] = await db.select().from(cliToken);
    expect(row?.expiresAt.getTime()).toBe(T0.getTime() + 180 * 86_400_000);
  });
});

describe("GET /cli/done", () => {
  it("shows the done copy", async () => {
    const res = await appWith().request("/cli/done");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("You're in. You can close this tab and head back to your terminal.");
    expect(body.toLowerCase()).not.toContain("missed");
  });
});
