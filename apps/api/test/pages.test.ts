import { describe, expect, it } from "vitest";
import { createApp } from "../src/create-app.ts";
import { createAuth } from "../src/auth.ts";
import { loadEnv } from "../src/env.ts";
import { escapeHtml } from "../src/pages/layout.ts";
import { safeNext } from "../src/pages/signin.ts";
import { createTestDb } from "./db.ts";

const fakeAuth = {
  handler: async () => new Response("auth-handler"),
  getSessionUser: async () => null,
};

async function app() {
  return createApp({
    db: await createTestDb(),
    auth: fakeAuth,
    minCliVersion: "0.0.0",
    publicUrl: "http://localhost",
  });
}

describe("pages", () => {
  it("home shows the install command", async () => {
    const res = await (await app()).request("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("npm i -g squii");
  });

  it("privacy page exists", async () => {
    const res = await (await app()).request("/privacy");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("signin ignores an off-site next", async () => {
    const res = await (await app()).request("/signin?next=//evil.example");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('const callbackURL = "/";');
  });

  it("signin keeps a safe next", async () => {
    const res = await (await app()).request("/signin?next=" + encodeURIComponent("/cli/authorize?x=1"));
    expect(await res.text()).toContain('const callbackURL = "/cli/authorize?x=1";');
  });

  it("signin cannot be broken out of the script", async () => {
    const res = await (await app()).request(
      "/signin?next=" + encodeURIComponent("/</script><script>alert(1)</script>"),
    );
    const body = await res.text();
    expect(body).not.toContain("</script><script>alert");
    expect(body).toContain("\\u003c");
  });

  it("no page contains 'missed'", async () => {
    const a = await app();
    for (const path of ["/", "/privacy", "/signin"]) {
      const body = await (await a.request(path)).text();
      expect(body.toLowerCase()).not.toContain("missed");
    }
  });

  it("pages make no external requests", async () => {
    const a = await app();
    for (const path of ["/", "/privacy", "/signin"]) {
      const body = await (await a.request(path)).text();
      expect(body).not.toMatch(/(src|href)="https?:/);
      expect(body).not.toContain("fonts.googleapis");
    }
  });

  it("mounts the auth handler", async () => {
    const a = await app();
    expect(await (await a.request("/api/auth/anything")).text()).toBe("auth-handler");
    expect(await (await a.request("/api/auth/anything", { method: "POST" })).text()).toBe("auth-handler");
  });
});

describe("safeNext", () => {
  it.each([
    [undefined, "/"],
    ["", "/"],
    ["//evil.example", "/"],
    ["/\\evil.example", "/"],
    ["https://evil.example", "/"],
    ["evil", "/"],
    ["/a\nb", "/"],
    ["/a\tb", "/"],
    ["/cli/authorize?x=1", "/cli/authorize?x=1"],
    ["/", "/"],
  ])("%j -> %j", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });
});

describe("escapeHtml", () => {
  it("escapes html metacharacters", () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
  });
});

describe("createAuth", () => {
  it("wires up and reports no user for empty headers", async () => {
    const env = loadEnv({
      STORAGE_DATABASE_URL: "postgres://unused",
      BETTER_AUTH_SECRET: "x".repeat(40),
      BETTER_AUTH_URL: "http://localhost:8787",
      GOOGLE_CLIENT_ID: "g-id",
      GOOGLE_CLIENT_SECRET: "g-secret",
      GITHUB_CLIENT_ID: "gh-id",
      GITHUB_CLIENT_SECRET: "gh-secret",
    });
    const auth = createAuth(await createTestDb(), env);
    expect(await auth.getSessionUser(new Headers())).toBeNull();
  });
});

describe("home copy", () => {
  it("marks the install as coming soon and does not mention squii hello", async () => {
    const text = await (await (await app()).request("/")).text();
    expect(text).toContain("npm i -g squii");
    expect(text).toContain("coming soon");
    expect(text).not.toContain("squii hello");
  });
});

describe("loadEnv", () => {
  const base = {
    STORAGE_DATABASE_URL: "postgres://unused",
    BETTER_AUTH_SECRET: "x",
    BETTER_AUTH_URL: "http://localhost:8787",
    GOOGLE_CLIENT_ID: "a",
    GOOGLE_CLIENT_SECRET: "a",
    GITHUB_CLIENT_ID: "a",
    GITHUB_CLIENT_SECRET: "a",
  };
  it("treats an empty MIN_CLI_VERSION as unset", () => {
    expect(loadEnv({ ...base, MIN_CLI_VERSION: "" }).MIN_CLI_VERSION).toBe("0.0.0");
    expect(loadEnv({ ...base, MIN_CLI_VERSION: "0.1.0" }).MIN_CLI_VERSION).toBe("0.1.0");
  });
});
