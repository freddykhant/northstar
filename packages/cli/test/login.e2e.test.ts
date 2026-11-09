import fs from "node:fs/promises";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { serve } from "@hono/node-server";
import { createApp, createTestDb, seedUser } from "@squii/api/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApiClient } from "../src/api/client.ts";
import { login } from "../src/auth/login.ts";
import { logoutCommand } from "../src/commands/logout.ts";
import { whoamiCommand } from "../src/commands/whoami.ts";
import { credentialsPath } from "../src/config/paths.ts";
import { readCredentials } from "../src/config/credentials.ts";

let server: ReturnType<typeof serve> & Pick<Server, "closeAllConnections">;
let userId: string;
let apiUrl: string;
let tmp: string;
let env: NodeJS.ProcessEnv;
let userName: string;
let lines: string[];
const savedXdg = process.env.XDG_CONFIG_HOME;

beforeEach(async () => {
  const db = await createTestDb();
  const u = await seedUser(db, { name: "Ada Lovelace", email: "ada@example.test" });
  userName = u.name;
  let origin = "";
  const app = createApp({
    db,
    auth: {
      handler: async () => new Response("unused"),
      getSessionUser: async (h) => (h.get("x-test-user") === u.id ? u : null),
    },
    minCliVersion: "0.0.0",
    get publicUrl() {
      return origin;
    },
  });
  server = serve({ fetch: app.fetch, port: 0, hostname: "127.0.0.1" }) as typeof server;
  await new Promise<void>((r) => (server.listening ? r() : server.once("listening", () => r())));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  apiUrl = origin;
  userId = u.id;
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "squii-e2e-"));
  process.env.XDG_CONFIG_HOME = tmp;
  env = process.env;
  lines = [];
});

afterEach(async () => {
  server.closeAllConnections();
  await new Promise<void>((r) => server.close(() => r()));
  if (savedXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = savedXdg;
  await fs.rm(tmp, { recursive: true, force: true });
});

async function fakeBrowser(url: string): Promise<void> {
  const headers = { "x-test-user": userId };
  const page = await (await fetch(url, { headers })).text();
  const form = new URLSearchParams();
  for (const m of page.matchAll(/<input type="hidden" name="([^"]+)" value="([^"]*)">/g)) {
    form.set(m[1] as string, (m[2] as string).replaceAll("&amp;", "&"));
  }
  const post = await fetch(new URL("/cli/authorize", apiUrl), {
    method: "POST",
    headers: { ...headers, "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });
  expect(post.status).toBe(302);
  const loop = await fetch(post.headers.get("location") as string, { redirect: "manual" });
  expect(loop.status).toBe(302);
  expect(loop.headers.get("location")).toBe(`${apiUrl}/cli/done`);
  const done = await fetch(loop.headers.get("location") as string);
  expect(done.status).toBe(200);
}

const print = (l: string) => void lines.push(l);

describe("squii login", () => {
  it("login saves credentials and whoami works", async () => {
    const creds = await login({ apiUrl, openBrowser: fakeBrowser, print });
    expect(lines[0]).toMatch(/^If your browser didn't open, visit: .*\/cli\/authorize\?/);
    expect(lines.at(-1)).toBe(`Signed in as ${userName}. Welcome to Squii!`);
    const stored = await readCredentials();
    expect(stored?.token).toBe(creds.token);
    expect(stored?.apiUrl).toBe(apiUrl);
    const me = await createApiClient({ baseUrl: apiUrl, token: stored?.token }).me.whoami.query();
    expect(me.name).toBe(userName);

    lines.length = 0;
    await whoamiCommand({ print, env });
    expect(lines).toEqual(["Ada Lovelace (ada@example.test)"]);
  });

  it("logout revokes the token server-side", async () => {
    await login({ apiUrl, openBrowser: fakeBrowser, print });
    const token = (await readCredentials())?.token;
    lines.length = 0;
    await logoutCommand({ print, env });
    expect(lines).toEqual(["Signed out. See you soon."]);
    await expect(fs.access(credentialsPath())).rejects.toThrow();
    await expect(
      createApiClient({ baseUrl: apiUrl, token }).me.whoami.query(),
    ).rejects.toMatchObject({ data: { code: "UNAUTHORIZED" } });

    lines.length = 0;
    await logoutCommand({ print, env });
    expect(lines).toEqual(["You're not signed in."]);
  });

  it("whoami without credentials says to log in", async () => {
    await expect(whoamiCommand({ print, env })).rejects.toThrow(
      "You're not signed in yet. Run `squii login`.",
    );
  });

  it("abandoned login times out without writing credentials", async () => {
    await expect(
      login({ apiUrl, openBrowser: async () => {}, print, timeoutMs: 100 }),
    ).rejects.toThrow("Sign-in timed out. Run `squii login` when you're ready.");
    expect(await readCredentials()).toBeNull();
  });
});
