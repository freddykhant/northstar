import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.ts";
import { sha256Base64Url } from "../src/cli-auth/crypto.ts";
import { cliToken } from "../src/db/schema.ts";
import type { Db } from "../src/db/client.ts";
import { createTestDb } from "./db.ts";
import { seedUser } from "./fixtures.ts";

const fakeAuth = {
  handler: async () => new Response("unused"),
  getSessionUser: async () => null,
};

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
});

function appWith(minCliVersion = "0.0.0") {
  return createApp({ db, auth: fakeAuth, minCliVersion, publicUrl: "http://localhost" });
}

async function putToken(userId: string, raw: string, expiresAt: Date) {
  await db.insert(cliToken).values({ userId, tokenHash: sha256Base64Url(raw), expiresAt });
}

const future = () => new Date(Date.now() + 86_400_000);

describe("app", () => {
  it("whoami returns the signed-in user", async () => {
    const u = await seedUser(db);
    await putToken(u.id, "sq_test", future());
    const res = await appWith().request("/trpc/me.whoami", {
      headers: { authorization: "Bearer sq_test" },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { result: { data: { json: unknown } } };
    expect(body.result.data.json).toEqual({ name: u.name, email: u.email });
  });

  it("whoami without a token is UNAUTHORIZED", async () => {
    const res = await appWith().request("/trpc/me.whoami");
    expect(res.status).toBe(401);
  });

  it("an expired token is UNAUTHORIZED", async () => {
    const u = await seedUser(db);
    await putToken(u.id, "sq_old", new Date(Date.now() - 1000));
    const res = await appWith().request("/trpc/me.whoami", {
      headers: { authorization: "Bearer sq_old" },
    });
    expect(res.status).toBe(401);
  });

  it("an old CLI gets 426 with minVersion", async () => {
    const res = await appWith("0.2.0").request("/trpc/me.whoami", {
      headers: { "x-squii-version": "0.1.9" },
    });
    expect(res.status).toBe(426);
    expect(await res.json()).toEqual({ error: "upgrade_required", minVersion: "0.2.0" });
  });

  it("0.10.0 is newer than 0.9.0", async () => {
    const res = await appWith("0.9.0").request("/trpc/me.whoami", {
      headers: { "x-squii-version": "0.10.0" },
    });
    expect(res.status).not.toBe(426);
  });

  it("an unparseable version is treated as too old", async () => {
    const res = await appWith("0.1.0").request("/trpc/me.whoami", {
      headers: { "x-squii-version": "banana" },
    });
    expect(res.status).toBe(426);
  });
});

describe("error surface", () => {
  async function authed(dbOverride?: Db) {
    const u = await seedUser(db);
    await putToken(u.id, "sq_t", future());
    const app = createApp({
      db: dbOverride ?? db,
      auth: fakeAuth,
      minCliVersion: "0.0.0",
      publicUrl: "http://localhost",
    });
    const post = async (path: string, input: unknown) => {
      const res = await app.request(`/trpc/${path}`, {
        method: "POST",
        headers: { authorization: "Bearer sq_t", "content-type": "application/json" },
        body: JSON.stringify({ json: input }),
      });
      const body = (await res.json()) as { error: { json: { message: string; data: { code: string } } } };
      return { status: res.status, message: body.error.json.message, code: body.error.json.data.code };
    };
    return { app, post };
  }

  it("turns validation failures into one friendly sentence", async () => {
    const { post } = await authed();
    const long = await post("habit.create", { name: "x".repeat(81), categoryId: "mind" });
    expect(long.code).toBe("BAD_REQUEST");
    expect(long.message).toBe("Habit names can be 1 to 80 characters.");
    const date = await post("mood.set", { date: "nope", today: "2026-11-09", level: 3 });
    expect(date.message).toBe("Dates look like 2026-11-09.");
    const level = await post("mood.set", { date: "2026-11-09", today: "2026-11-09", level: 9 });
    expect(level.message).toBe("Mood is a number from 1 to 5.");
    const id = await post("habit.archive", { id: -1 });
    expect(id.message).toBe("No habit with that id.");
    for (const r of [long, date, level, id]) expect(r.message).not.toMatch(/[\[{\n]/);
  });

  it("leaves router-authored messages alone", async () => {
    const { post } = await authed();
    const r = await post("completion.ink", { habitId: 1, date: "2000-01-01", today: "2000-01-01" });
    expect(r.message).toBe("Your computer's date looks off.");
  });

  it("hides internal errors (no SQL) and logs them server-side", async () => {
    const boom = new Error('Failed query: insert into "habit" params: secret-name');
    const broken = new Proxy(db, {
      get(target, prop, recv) {
        if (prop === "insert") return () => { throw boom; };
        return Reflect.get(target, prop, recv);
      },
    }) as Db;
    const { post } = await authed(broken);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await post("habit.create", { name: "Read", categoryId: "mind" });
    expect(r.code).toBe("INTERNAL_SERVER_ERROR");
    expect(r.message).toBe("Something went wrong on Squii's side.");
    expect(r.message).not.toMatch(/Failed query|insert/);
    expect(spy).toHaveBeenCalled();
    expect(JSON.stringify(spy.mock.calls)).not.toContain("sq_t");
    spy.mockRestore();
  });

  it("logout still works from an outdated CLI", async () => {
    const u = await seedUser(db);
    await putToken(u.id, "sq_old_cli", future());
    const app = appWith("0.2.0");
    const res = await app.request("/cli/revoke", {
      method: "POST",
      headers: { authorization: "Bearer sq_old_cli", "x-squii-version": "0.0.1" },
    });
    expect(res.status).toBe(204);
    const after = await app.request("/trpc/me.whoami", { headers: { authorization: "Bearer sq_old_cli" } });
    expect(after.status).toBe(401);
  });
});
