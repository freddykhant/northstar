import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createApp } from "./create-app.ts";
import { createAuth } from "./auth.ts";
import { createDb } from "./db/client.ts";
import { loadEnv } from "./env.ts";

// Repo-root .env, if present; a missing file falls through to loadEnv's own error.
const envFile = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const env = loadEnv();
const db = createDb(env.STORAGE_DATABASE_URL);
const api = createApp({
  db,
  auth: createAuth(db, env),
  minCliVersion: env.MIN_CLI_VERSION,
  publicUrl: env.BETTER_AUTH_URL,
});

const publicDir = fileURLToPath(new URL("../public", import.meta.url));
const app = new Hono();
app.get("/squid.png", serveStatic({ root: publicDir, rewriteRequestPath: () => "/squid.png" }));
app.route("/", api);

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Squii API listening on http://localhost:${info.port}`);
});
