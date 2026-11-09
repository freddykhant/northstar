# Deploying the Squii API

The API (`apps/api`) runs on Vercel at https://northstar-one.vercel.app. The Vercel entry source is `apps/api/src/vercel.ts`; it imports `Hono`, mounts the `createApp` app (from `src/create-app.ts`) on a new `Hono` instance and default-exports it. Vercel runs the package's `build` script (`node build.mjs`), which bundles it with esbuild into `apps/api/server.mjs` (gitignored), and the Hono preset serves that file's default export. See "Notes on how Vercel builds this" for why. Static files in `apps/api/public/` (for example `squid.png`) are served by Vercel's CDN, not by the app.

## Settings that must be exact

- `BETTER_AUTH_URL` must be exactly `https://northstar-one.vercel.app` (no trailing slash). Sign-in and the CLI confirm page check origins against it, so Vercel preview URLs cannot complete a sign-in.
- `MIN_CLI_VERSION` should be a real version such as `0.1.0`. An empty value is treated as unset and falls back to `0.0.0`, which accepts every CLI.
- `BETTER_AUTH_SECRET` comes from `openssl rand -base64 32`.
- The entry reads the environment at import time, so a missing variable fails the cold start with a zod error in the runtime logs (the browser only shows "This page is unavailable"). Each variable must be ticked for **Production and Preview**; a Sensitive variable added for Production only is undefined on previews. Env changes apply only to new deployments, so redeploy after editing.

## Local development

1. Copy `.env.example` to `.env` at the repo root and fill it in. Use the local GitHub OAuth app and set `BETTER_AUTH_URL=http://localhost:8787`.
2. Run `pnpm dev:api`. It serves on port 8787 and also serves `/squid.png`.
3. OAuth callbacks for local dev are `http://localhost:8787/api/auth/callback/github` and `.../google`.

## Steps

Order matters: prove the new build boots on Vercel (preview, no database needed) before wiping anything.

1. **Freddy: claim the npm name.** `npm login`, then publish a placeholder `squii@0.0.1` with a README line "coming soon". Check: `npm view squii name` prints `squii`.
2. **Freddy: GitHub OAuth apps.** Production: homepage `https://northstar-one.vercel.app`, callback `https://northstar-one.vercel.app/api/auth/callback/github`. Local: a second app with callback `http://localhost:8787/api/auth/callback/github`.
3. **Freddy: Google OAuth client.** Add the redirect URIs `https://northstar-one.vercel.app/api/auth/callback/google` and `http://localhost:8787/api/auth/callback/google`. On the consent screen set the homepage to the absolute URL `https://northstar-one.vercel.app/` and the privacy policy to `https://northstar-one.vercel.app/privacy` (relative paths are rejected), then publish it to production.
4. **Freddy: Vercel project.** Root directory `apps/api`, framework preset Hono, and turn ON "Include source files outside of the Root Directory in the Build Step" (the API imports `packages/core`). Env vars, each set for **both Production and Preview**: `STORAGE_DATABASE_URL` (existing), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=https://northstar-one.vercel.app`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MIN_CLI_VERSION=0.1.0`.
5. **Prove the build boots (preview).** Optional first, locally: `pnpm --filter @squii/api build` and import `apps/api/server.mjs` with plain `node`. Then push the branch so Vercel makes a **preview** deployment; production is untouched. Previews sit behind Vercel Deployment Protection, so `curl` gets a 302 to a Vercel login; open the **preview URL** (`$PREVIEW`, from `vercel ls northstar`) in a browser signed in to Vercel instead. Neither check needs the database:
   - `$PREVIEW/` shows the Squii page with `npm i -g squii`.
   - `$PREVIEW/trpc/me.whoami` shows a JSON `UNAUTHORIZED` error (the 426 check with an old `x-squii-version` runs against production in step 7, where curl works).
   - If either shows "This page is unavailable", read the deployment's Runtime Logs in the dashboard (`vercel logs` only streams new lines). Do not continue to step 6 until both checks pass.
6. **Create the Squii tables (done 2026-11-09, additive).** The new tables (`user`, `session`, `account`, `verification`, `habit`, `completion`, `mood`, `cli_auth_code`, `cli_token`) were created beside the old `northstar_*` tables, so the old production app kept working until the promote. How it was done, for a fresh database:
   - Postgres index names are schema-wide. The old `northstar_completion` had an index named `completion_user_date_idx`, which collided with ours; it was renamed to `northstar_completion_user_date_idx` first.
   - Migrate with drizzle-kit, which runs the migration in one transaction: `node --env-file=../../.env node_modules/drizzle-kit/bin.cjs migrate` from `apps/api`. drizzle-kit exits 1 **without printing the error** when a statement fails; to see it, read the error from a disposable database, not from drizzle-orm's `neon-http` migrator against production: that migrator is not transactional and leaves a half-applied schema.
   - Check: the 9 tables exist and `select count(*) from drizzle.__drizzle_migrations` is 1.
   - Dropping the old tables happens after step 8, and only with Freddy's go-ahead at the time: `DROP TABLE northstar_category, northstar_habit, northstar_completion, northstar_user, northstar_account, northstar_session, northstar_verification_token CASCADE;` (there is no `northstar_mood` in production).
7. **Promote to production.** Merge the branch (or promote the preview in the Vercel dashboard). Smoke-test production the same way as step 5 but with `https://northstar-one.vercel.app`.
8. **Freddy: real sign-in.** `node packages/cli/dist/index.js login`; the browser opens, sign in with Google, Continue, "You're in". Check: `node packages/cli/dist/index.js whoami` prints name and email. Repeat with GitHub after `logout`.

## Notes on how Vercel builds this

Vercel's Hono docs (https://vercel.com/docs/frameworks/backend/hono) look for an entry that imports `hono` at `app.*`, `index.*` or `server.*` in the project root, then under `src/`, and serve `public/**` from the CDN (Hono `serveStatic` is ignored). What we learned deploying it (Nov 2026):

- **One entry name only.** With both `src/app.ts` and `src/index.ts` present the preset picked `src/app.ts` (a factory with no default export). Keep `src/` free of `app.*`, `index.*` and `server.*`; the factory lives in `src/create-app.ts` and the entry source in `src/vercel.ts`.
- **No unbundled `.ts` imports.** Vercel compiled each `.ts` file to `.js` but kept our `./x.ts` import specifiers, so the function died with `ERR_MODULE_NOT_FOUND`. `apps/api/build.mjs` therefore bundles `src/vercel.ts` and the workspace's `@squii/core` into root-level `server.mjs`, keeping npm dependencies external so Vercel installs and traces them (and so `server.mjs` still imports `hono`, which the preset looks for). Vercel runs it as the package `build` script after install, then detects `server.mjs`.
