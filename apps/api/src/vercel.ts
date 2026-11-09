// Vercel entry, bundled into server.mjs by build.mjs (Vercel runs the `build`
// script; the Hono preset then uses server.mjs's default export). Keep src/ free
// of preset entry names (app, index, server): the preset would pick those first.
// Env is read at import, so a missing variable fails the cold start loudly.
import { Hono } from "hono";
import { createApp } from "./create-app.ts";
import { createAuth } from "./auth.ts";
import { createDb } from "./db/client.ts";
import { loadEnv } from "./env.ts";

const env = loadEnv();
const db = createDb(env.STORAGE_DATABASE_URL);

const app = new Hono();
app.route(
  "/",
  createApp({
    db,
    auth: createAuth(db, env),
    minCliVersion: env.MIN_CLI_VERSION,
    publicUrl: env.BETTER_AUTH_URL,
  }),
);

export default app;
