# Deploying the Squii API

The API (`apps/api`) runs on Vercel at https://northstar-one.vercel.app. The Vercel entry is `apps/api/src/index.ts`; it default-exports the Hono app from `createApp`. Static files in `apps/api/public/` (for example `squid.png`) are served by Vercel's CDN, not by the app.

## Settings that must be exact

- `BETTER_AUTH_URL` must be exactly `https://northstar-one.vercel.app` (no trailing slash). Sign-in and the CLI confirm page check origins against it, so Vercel preview URLs cannot complete a sign-in.
- `MIN_CLI_VERSION` must be a real version such as `0.1.0`, never empty.
- `BETTER_AUTH_SECRET` comes from `openssl rand -base64 32`.
- The entry reads the environment at import time, so a missing variable fails the cold start with a zod error in the runtime logs.

## Local development

1. Copy `.env.example` to `.env` at the repo root and fill it in. Use the local GitHub OAuth app and set `BETTER_AUTH_URL=http://localhost:8787`.
2. Run `pnpm dev:api`. It serves on port 8787 and also serves `/squid.png`.
3. OAuth callbacks for local dev are `http://localhost:8787/api/auth/callback/github` and `.../google`.

## Steps

1. **Freddy: claim the npm name.** `npm login`, then publish a placeholder `squii@0.0.1` with a README line "coming soon". Check: `npm view squii name` prints `squii`.
2. **Freddy: GitHub OAuth apps.** Production: homepage `https://northstar-one.vercel.app`, callback `https://northstar-one.vercel.app/api/auth/callback/github`. Local: a second app with callback `http://localhost:8787/api/auth/callback/github`.
3. **Freddy: Google OAuth client.** Add the redirect URIs `https://northstar-one.vercel.app/api/auth/callback/google` and `http://localhost:8787/api/auth/callback/google`. On the consent screen set the homepage to `/` and the privacy policy to `/privacy`, then publish it to production.
4. **Freddy: Vercel project.** Root directory `apps/api`, framework preset Hono. Env vars: `STORAGE_DATABASE_URL` (existing), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=https://northstar-one.vercel.app`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MIN_CLI_VERSION=0.1.0`.
5. **Reset the database (destructive; Freddy must reconfirm the wipe at the time).** Drop the old `northstar_*` tables, then run `pnpm --filter @squii/api exec drizzle-kit migrate`. Check: `\dt` lists exactly `user, session, account, verification, habit, completion, mood, cli_auth_code, cli_token` plus drizzle's migrations table.
6. **Deploy and smoke-test.** Push the branch and let Vercel build, or ask Freddy to promote it. Checks:
   - `curl -s https://northstar-one.vercel.app/ | grep "npm i -g squii"` matches.
   - `curl -s -o /dev/null -w "%{http_code}" -H "x-squii-version: 0.0.1" https://northstar-one.vercel.app/trpc/me.whoami` prints `426`.
7. **Freddy: real sign-in.** `node packages/cli/dist/index.js login`; the browser opens, sign in with Google, Continue, "You're in". Check: `node packages/cli/dist/index.js whoami` prints name and email. Repeat with GitHub after `logout`.

## Notes on how Vercel builds this

Vercel's Hono docs (https://vercel.com/docs/frameworks/backend/hono) detect `src/index.ts` and use its default export, serve `public/**` from the CDN (Hono `serveStatic` is ignored), and need no build command or `vercel.json`. They do not say whether workspace TypeScript source and `.ts`-extension imports are bundled. A local esbuild bundle of the entry (`--bundle --platform=node --format=esm`) imports and serves with plain `node`. If the first deploy fails with a module resolution or `.ts` error, add a build step that bundles `src/index.ts` into a self-contained file Vercel detects.
