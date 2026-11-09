// Vercel entry (Hono preset detects src/index.ts and uses the default export).
// Env is read at import, so a missing variable fails the cold start loudly.
import { createApp } from "./app.ts";
import { createAuth } from "./auth.ts";
import { createDb } from "./db/client.ts";
import { loadEnv } from "./env.ts";

const env = loadEnv();
const db = createDb(env.STORAGE_DATABASE_URL);

export default createApp({
  db,
  auth: createAuth(db, env),
  minCliVersion: env.MIN_CLI_VERSION,
  publicUrl: env.BETTER_AUTH_URL,
});
