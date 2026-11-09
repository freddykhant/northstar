import { beforeEach, describe, expect, it } from "vitest";
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
