# Squii CLI, Plan 1 of 5: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Next.js app with a pnpm workspace holding a shared `core`
package, a hosted Squii API (tRPC + Better Auth + Drizzle/Neon) and a `squii`
CLI that can `login`, `logout` and `whoami` using browser OAuth with PKCE.

**Architecture:** `apps/api` is a Hono app deployed to Vercel. It mounts Better
Auth (browser sign-in with Google/GitHub) at `/api/auth/*`, the CLI auth
handshake at `/cli/*`, and tRPC at `/trpc/*`. The CLI never touches the
database. It holds a Squii-issued bearer token (hashed server-side in
`cli_token`) and calls tRPC with `import type { AppRouter }` from the API.
Router logic is tested against in-memory Postgres (PGlite), so tests need no
Neon or Google.

**Tech Stack:** Node 22.12+, pnpm 10 workspaces, TypeScript 5, hono 4.13,
@hono/node-server 2, @trpc/server + client 11.25, superjson 2, zod 4,
drizzle-orm 0.45 + drizzle-kit 0.31, @neondatabase/serverless 1.2 (neon-http),
@electric-sql/pglite 0.5 (tests), better-auth 1.7, commander 15,
@clack/prompts 1.8, open 11, tsup 9, vitest 5.

**Spec:** `docs/superpowers/specs/2026-11-09-squii-cli-design.md`. Read §4.4
(errors), §5 (shape, API, auth, data model) and §6 (quality bar) before
starting.

**What Plans 2–5 cover (not this plan):** 2 = one-shot habit commands
(`add`, `remove`, `update`, `ink`, `undo`, `mood`, `quote`, `year`, `week`,
`boop`); 3 = `squii hello` session, graph rendering, animation; 4 = `squii
web`; 5 = SSH paste-code fallback, release pass and publishing. This plan
builds the API procedures those plans call, so they only add client code.

## Global Constraints

- Node `>=22.12.0` in every `package.json` `engines` field.
- **No database credentials in anything shipped to users.** `packages/cli` must never import `drizzle-orm`, `@neondatabase/serverless` or any `apps/api` runtime module. Only `import type` is allowed.
- **No native dependencies and no postinstall scripts** in `packages/cli`.
- Dates crossing the API are the user's local calendar date as `YYYY-MM-DD` strings. **The server never derives "today" from its own clock**, except to sanity-check a client's `today` (Task 6).
- Every user-facing error is **one plain sentence plus the fixing command, never a stack trace**. Details only with `--debug` or `SQUII_DEBUG=1`.
- Exact error copy (spec §4.4, §5.3):
  - not signed in → `You're not signed in yet. Run \`squii login\`.`
  - expired or revoked token → `You've been signed out. Run \`squii login\`.`
  - offline → `Squii can't reach the internet right now.`
- Production API URL compiled into the CLI: `https://northstar-one.vercel.app`, overridable with `SQUII_API_URL`.
- Credentials live in `$XDG_CONFIG_HOME/squii/` (default `~/.config/squii/`) on macOS and Linux alike: dir mode `0700`, file mode `0600`.
- Squii has no sad face and nothing ever says "you missed". This applies to every page and message in this plan too.
- Categories are exactly `mind | body | soul`, in that order everywhere.

## Review Focus

1. **A client's `today` in a far-off time zone** (UTC+14 or UTC−12): inking must work for real users anywhere, but `today` values more than one day from the server's UTC date must be rejected. Pinned in Task 6.
2. **Habit names that differ only by case or surrounding spaces** (`" Read "` vs `"read"`): treat them as the same active habit, and let the name be reused once the old one is archived. Pinned in Task 5.
3. **Inking the same habit twice on one day** (two terminals, or a retried request): it must succeed once and report "already inked", never error or create a duplicate. Pinned in Task 6.
4. **A replayed or stolen auth code** (the redirect URL lands in browser history): a second redemption, a redemption after 60 seconds, or a wrong `code_verifier` must all fail. Pinned in Task 8.
5. **Login abandoned halfway** (user closes the browser tab): `squii login` must give up after 5 minutes with one sentence, free its port and leave no partial credentials file. Pinned in Task 10.

---

## File Structure

```
package.json                    workspace root: scripts only
pnpm-workspace.yaml
tsconfig.base.json
vitest.config.ts                root: test.projects = packages/*, apps/*
packages/core/
  src/categories.ts             category ids, labels, light/dark hex
  src/dates.ts                  LocalDate type + date maths
  src/stats.ts                  streaks and week %
  src/index.ts
apps/api/
  drizzle.config.ts
  drizzle/                      generated migrations
  src/env.ts                    zod-parsed env
  src/db/app-schema.ts          habits, completions, moods
  src/db/auth-schema.ts         Better Auth tables (generated)
  src/db/cli-schema.ts          cli_auth_code, cli_token
  src/db/schema.ts              re-exports all three
  src/db/client.ts              createDb (neon-http), Db type
  src/auth.ts                   createAuth (Better Auth)
  src/cli-auth/crypto.ts        sha256, randomToken, verifyPkce
  src/cli-auth/store.ts         auth codes + tokens (DB ops)
  src/cli-auth/routes.ts        /cli/* Hono routes
  src/pages/*.ts                HTML: home, privacy, signin, cli-confirm, cli-done
  src/trpc/init.ts              context, router, protectedProcedure
  src/trpc/routers/{me,habit,completion,mood}.ts
  src/trpc/root.ts              appRouter + AppRouter type
  src/app.ts                    createApp(deps): Hono
  src/index.ts                  Vercel entry
  src/dev.ts                    local node server
  test/db.ts                    createTestDb (PGlite + migrations)
  test/fixtures.ts              seedUser, callerFor
packages/cli/
  tsup.config.ts
  src/index.ts                  bin: commander program
  src/version.ts
  src/config/paths.ts
  src/config/credentials.ts
  src/api/client.ts
  src/api/errors.ts
  src/auth/pkce.ts
  src/auth/loopback.ts
  src/auth/login.ts
  src/commands/{login,logout,whoami}.ts
```

---

### Task 1: Workspace skeleton, removing the Next.js app

**Files:**
- Delete: `src/`, `next.config.js`, `postcss.config.js`, `eslint.config.js`, `prettier.config.js`, `drizzle/`, `drizzle.config.ts`, `scripts/`, `start-database.sh`, `vitest.config.ts`, `tsconfig.json`, `REFACTORING.md`
- Move: `public/squid.png` → `apps/api/public/squid.png`. Delete the rest of `public/`.
- Create: `package.json` (replace), `pnpm-workspace.yaml`, `tsconfig.base.json`, `vitest.config.ts`, `packages/core/{package.json,tsconfig.json,src/index.ts}`, `packages/core/test/smoke.test.ts`
- Modify: `README.md` (stack section → "TypeScript CLI (Ink, clack), Hono + tRPC API, Drizzle + Neon, Better Auth"), `.gitignore` (drop `.next`, keep `.superpowers/`, add `dist/`)

**Interfaces:**
- Produces: package names `@squii/core`, `@squii/api` (Task 3), `squii` (Task 9). Root scripts `pnpm test`, `pnpm typecheck`.

- [ ] **Step 1: Tag the last web version so Plan 4 can retrieve the React mosaic components**

Run: `git tag web-final && git tag --list web-final`
Expected: `web-final`

- [ ] **Step 2: Delete and move the files listed above, then write the root files**

Root `package.json`: `"private": true`, `"type": "module"`, `"packageManager": "pnpm@10.28.0"`, `"engines": {"node": ">=22.12.0"}`, scripts `test: vitest run`, `typecheck: pnpm -r typecheck`. Dev deps: `typescript@^5.8`, `vitest@^5.1`, `@types/node@^22`.
`pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]`.
`tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `module`/`moduleResolution` `NodeNext`, `target` `ES2023`, `verbatimModuleSyntax`.
`vitest.config.ts`: `test.projects: ["packages/*", "apps/*"]`.
`packages/core/package.json`: name `@squii/core`, `"type": "module"`, `exports: {".": "./src/index.ts"}` (source exports; consumers bundle it), script `typecheck: tsc --noEmit`.

- [ ] **Step 3: Write a smoke test** `packages/core/test/smoke.test.ts` asserting `import * as core from "../src/index.ts"` resolves (`expect(core).toBeDefined()`).

- [ ] **Step 4: Install and verify**

Run: `pnpm install && pnpm test && pnpm typecheck`
Expected: install succeeds, 1 test passes, typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: replace Next.js app with pnpm workspace skeleton"
```

---

### Task 2: `@squii/core`: categories, dates, stats

**Files:**
- Create: `packages/core/src/categories.ts`, `src/dates.ts`, `src/stats.ts`
- Modify: `packages/core/src/index.ts` (re-export all three)
- Test: `packages/core/test/dates.test.ts`, `test/stats.test.ts`, `test/categories.test.ts`
- Delete: `packages/core/test/smoke.test.ts`

**Interfaces:**
- Produces:
  - `CATEGORY_IDS: readonly ["mind","body","soul"]`, `type CategoryId`, `CATEGORY_LABELS: Record<CategoryId,string>`, `CATEGORY_HEX: { light: Record<CategoryId|"perfect"|"empty", string>; dark: Record<CategoryId|"perfect"|"empty", string> }`
  - `type LocalDate = string` (`YYYY-MM-DD`), `isLocalDate(s: string): s is LocalDate`, `localToday(now?: Date): LocalDate` (uses the machine's local time zone), `addDays(d: LocalDate, n: number): LocalDate`, `daysBetween(a: LocalDate, b: LocalDate): number` (b − a)
  - `type Stats = { currentStreak: number; bestStreak: number; totalInked: number; weekPercent: number }`, `computeStats(input: { inkedDates: LocalDate[]; today: LocalDate; activeHabitCount: number }): Stats`. `inkedDates` has one entry per completion, so duplicates mean several habits that day.

- [ ] **Step 1: Write failing tests**

`categories.test.ts`: the values below are copied from the spec §3.
```ts
expect(CATEGORY_IDS).toEqual(["mind", "body", "soul"]);
expect(CATEGORY_HEX.light).toEqual({ mind: "#6c5ce7", body: "#f2542d", soul: "#0fa47f", perfect: "#d4a017", empty: "#e7e4f1" });
expect(CATEGORY_HEX.dark).toEqual({ mind: "#9c8fff", body: "#ff7d5c", soul: "#35c9a3", perfect: "#ffce54", empty: "#26242f" });
```
`dates.test.ts`:
```ts
expect(isLocalDate("2026-02-29")).toBe(false); // not a leap year
expect(isLocalDate("2028-02-29")).toBe(true);
expect(isLocalDate("2026-1-05")).toBe(false);
expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
expect(daysBetween("2026-10-25", "2026-10-26")).toBe(1); // across a DST change
expect(localToday(new Date(2026, 10, 9, 23, 59))).toBe("2026-11-09");
```
`stats.test.ts`:
```ts
const today = "2026-11-09";
expect(computeStats({ inkedDates: [], today, activeHabitCount: 3 }))
  .toEqual({ currentStreak: 0, bestStreak: 0, totalInked: 0, weekPercent: 0 });
// streak survives an un-inked today, counted from yesterday
expect(computeStats({ inkedDates: ["2026-11-07", "2026-11-08"], today, activeHabitCount: 1 }).currentStreak).toBe(2);
// a gap breaks it
expect(computeStats({ inkedDates: ["2026-11-06", "2026-11-08", "2026-11-09"], today, activeHabitCount: 1 }).currentStreak).toBe(2);
// best streak across a year boundary; duplicates on a day count once for streaks
expect(computeStats({ inkedDates: ["2025-12-30", "2025-12-31", "2026-01-01", "2026-01-01"], today, activeHabitCount: 2 }).bestStreak).toBe(3);
// week = the 7 days ending today inclusive; 2 habits × 7 = 14 possible
expect(computeStats({ inkedDates: ["2026-11-03", "2026-11-09", "2026-11-09", "2026-11-02"], today, activeHabitCount: 2 }).weekPercent).toBe(21); // 3/14 → 21 (11-02 is outside)
// never above 100 (archived habits' ticks still count as inked)
expect(computeStats({ inkedDates: Array(20).fill(today), today, activeHabitCount: 1 }).weekPercent).toBe(100);
expect(computeStats({ inkedDates: [today], today, activeHabitCount: 0 }).weekPercent).toBe(0);
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `pnpm vitest run packages/core`
Expected: FAIL, missing exports.

- [ ] **Step 3: Implement the three modules**

Do date maths on UTC midnights built from the `YYYY-MM-DD` parts (`Date.UTC`), never on local `Date` arithmetic, so DST can't shift a day. `weekPercent = round(100 × inks in [today−6, today] / (7 × activeHabitCount))`, capped at 100, and 0 when `activeHabitCount` is 0. This fixes the old 8-day window bug in `getOverallStats`.

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `pnpm vitest run packages/core`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core
git commit -m "feat(core): categories, local dates and stats"
```

---

### Task 3: API package, schema, migrations, test database

**Files:**
- Create: `apps/api/{package.json,tsconfig.json,drizzle.config.ts}`, `src/env.ts`, `src/db/{app-schema,auth-schema,cli-schema,schema,client}.ts`, `test/db.ts`
- Generate: `apps/api/drizzle/0000_*.sql`
- Test: `apps/api/test/schema.test.ts`

**Interfaces:**
- Consumes: `CATEGORY_IDS` from `@squii/core`.
- Produces:
  - Tables (`snake_case` columns, no prefix): `habit(id serial pk, user_id → user.id cascade, name text, category_id text check in mind/body/soul, archived_at timestamptz null, created_at, updated_at)` with a **partial unique index on `(user_id, lower(name)) where archived_at is null`**. `completion(id serial pk, habit_id → habit cascade, user_id → user cascade, date date (mode "string"), category_id text, created_at)`, unique `(habit_id, date)`, index `(user_id, date)`. `mood(id serial pk, user_id → user cascade, date date, level int check 1–5)`, unique `(user_id, date)`. `cli_auth_code(code_hash text pk, user_id → user cascade, code_challenge text, expires_at timestamptz)`. `cli_token(id serial pk, user_id → user cascade, token_hash text unique, created_at, last_used_at, expires_at)`.
  - Better Auth's `user`, `session`, `account`, `verification` tables in `auth-schema.ts`.
  - `type Db = PgDatabase<PgQueryResultHKT, typeof schema>`, `createDb(url: string): Db` (neon-http), `createTestDb(): Promise<Db>` (PGlite in-memory with `migrate()` applied from `apps/api/drizzle`).
  - `env.ts`: `loadEnv(source = process.env)` returning `{ STORAGE_DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, MIN_CLI_VERSION }`, all required strings except `MIN_CLI_VERSION` (default `"0.0.0"`).

- [ ] **Step 1: Create the package** `@squii/api` (`private`, `"type": "module"`), with deps `drizzle-orm@^0.45`, `@neondatabase/serverless@^1.2`, `better-auth@^1.7`, `zod@^4`, `@squii/core: workspace:*`, and dev deps `drizzle-kit@^0.31`, `@electric-sql/pglite@^0.5`. `drizzle.config.ts`: dialect `postgresql`, schema `./src/db/schema.ts`, out `./drizzle`, URL from `STORAGE_DATABASE_URL`.

- [ ] **Step 2: Write the app and CLI schemas** as specified under Produces, then generate the Better Auth schema.

Run: `pnpm --filter @squii/api dlx @better-auth/cli@1.7 generate --output src/db/auth-schema.ts` (point it at a minimal `src/auth.ts` that only sets the drizzle adapter with `provider: "pg"`; Task 7 fills `auth.ts` in).
Expected: `auth-schema.ts` exports `user`, `session`, `account`, `verification`.

- [ ] **Step 3: Generate the migration**

Run: `pnpm --filter @squii/api exec drizzle-kit generate`
Expected: one `drizzle/0000_*.sql` creating all 9 tables. The partial unique index's SQL contains `lower("name")` and `WHERE "habit"."archived_at" IS NULL`.

- [ ] **Step 4: Write a failing test** `test/schema.test.ts`, run against `createTestDb()`:
- `"rejects a second active habit whose name differs only by case"`: insert `Read` then `read` for the same user → rejects with Postgres code `23505`.
- `"allows reusing a name once the old habit is archived"`: insert `Read` with `archived_at = now()`, then `read` → succeeds.
- `"rejects a category outside mind/body/soul"` → code `23514`.
- `"rejects a second completion for the same habit and date"` → `23505`.
- `"rejects mood level 0 and 6"` → `23514`.

- [ ] **Step 5: Run it to make sure it fails** (Run: `pnpm vitest run apps/api/test/schema.test.ts`. Expected: FAIL, `createTestDb` not defined), then **implement `test/db.ts` and `src/db/client.ts`**, and rerun. Expected: 5 PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api
git commit -m "feat(api): Drizzle schema, migrations and PGlite test db"
```

---

### Task 4: tRPC context, `me.whoami`, version gate, Hono app

**Files:**
- Create: `apps/api/src/trpc/{init,root}.ts`, `src/trpc/routers/me.ts`, `src/app.ts`, `src/cli-auth/crypto.ts`, `src/cli-auth/store.ts`, `src/testing.ts`, `test/fixtures.ts`
- Test: `apps/api/test/app.test.ts`

**Interfaces:**
- Consumes: `Db`, `createTestDb`.
- Produces:
  - `cli-auth/crypto.ts`: `sha256Base64Url(s: string): string`, `randomToken(bytes = 32): string` (base64url).
  - `cli-auth/store.ts`: `resolveCliToken(db, raw: string, now: Date): Promise<string | null>` (looks up `sha256Base64Url(raw)` and returns the userId if `expires_at > now`). Task 8 adds sliding expiry and the other store functions to this file.
  - `@squii/api` package `exports`: `"./router"` → `src/trpc/root.ts` (types for the CLI), `"./testing"` → `src/testing.ts`, which re-exports `createApp`, `createTestDb`, `seedUser` and `sha256Base64Url` for the CLI's end-to-end test.
  - `type Context = { db: Db; userId: string | null; now: () => Date }`, `router`, `publicProcedure`, `protectedProcedure` (throws `UNAUTHORIZED` when `userId` is null, then narrows `userId` to `string`). Transformer: `superjson`.
  - `appRouter = router({ me, habit, completion, mood })` (Tasks 5–6 add `habit`, `completion`, `mood`), `export type AppRouter = typeof appRouter`.
  - `me.whoami: query → { name: string; email: string }`.
  - `type AppDeps = { db: Db; auth: { handler(req: Request): Promise<Response>; getSessionUser(headers: Headers): Promise<{ id: string; name: string; email: string } | null> }; minCliVersion: string; publicUrl: string; now?: () => Date }`, `createApp(deps: AppDeps): Hono`.
  - Header contract: requests send `authorization: Bearer <token>` and `x-squii-version: <semver>`.
  - Upgrade response: HTTP **426** with JSON `{ "error": "upgrade_required", "minVersion": "<semver>" }` when `x-squii-version` is present and lower than `minCliVersion`. A missing header (browser) passes.
  - Fixtures: `seedUser(db, overrides?) → { id, name, email }`, `callerFor(db, userId | null, now?) → appRouter.createCaller(ctx)`.

- [ ] **Step 1: Write failing tests** `test/app.test.ts`, using `createApp` with a fake `auth` and `app.request()`:
- `"whoami returns the signed-in user"`: seed a user, put a token for them in `cli_token` (insert directly, `token_hash = sha256("sq_test")`), GET `/trpc/me.whoami` with `Bearer sq_test` → 200 and the user's name/email (superjson body `result.data.json`).
- `"whoami without a token is UNAUTHORIZED"` → 401.
- `"an expired token is UNAUTHORIZED"`: `expires_at` in the past → 401.
- `"an old CLI gets 426 with minVersion"`: `minCliVersion: "0.2.0"`, header `x-squii-version: 0.1.9` → 426, body `{ error: "upgrade_required", minVersion: "0.2.0" }`.
- `"0.10.0 is newer than 0.9.0"`: `minCliVersion: "0.9.0"`, header `0.10.0` → not 426.

- [ ] **Step 2: Run them to make sure they fail**

Run: `pnpm vitest run apps/api/test/app.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `crypto.ts`, `store.ts`'s `resolveCliToken`, `init.ts`, `me.ts`, `root.ts`, `createApp` and `testing.ts`.** Mount tRPC with `fetchRequestHandler` from `@trpc/server/adapters/fetch` at `/trpc/*`. The context reads the bearer token and calls `resolveCliToken`. Compare versions numerically per segment, without a semver dependency.

- [ ] **Step 4: Run the tests to make sure they pass.** Run: `pnpm vitest run apps/api`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api
git commit -m "feat(api): tRPC context, whoami and CLI version gate"
```

---

### Task 5: `habit` router

**Files:**
- Create: `apps/api/src/trpc/routers/habit.ts`
- Modify: `apps/api/src/trpc/root.ts`
- Test: `apps/api/test/habit.test.ts`

**Interfaces:**
- Consumes: `protectedProcedure`, `callerFor`, `seedUser`, `CATEGORY_IDS`.
- Produces (`type Habit = { id: number; name: string; categoryId: CategoryId; archivedAt: Date | null; createdAt: Date }`):
  - `habit.list: query({ includeArchived?: boolean }) → Habit[]`, active only by default, ordered `mind, body, soul`, then `createdAt` ascending.
  - `habit.create: mutation({ name: string; categoryId: CategoryId }) → Habit`
  - `habit.update: mutation({ id: number; name?: string; categoryId?: CategoryId }) → Habit`
  - `habit.archive: mutation({ id: number }) → Habit`
  - Name rule: trim, then collapse internal whitespace to one space. Must be 1–80 characters after that. A duplicate active name throws `CONFLICT` with message `You already have a habit called '<existing name>'.`
  - Another user's or a missing habit throws `NOT_FOUND` with message `No habit with that id.`

- [ ] **Step 1: Write failing tests** `test/habit.test.ts`:
- `"create trims and collapses whitespace"`: `"  read   10  pages "` → name `"read 10 pages"`.
- `"create rejects a name that is only spaces"` → `BAD_REQUEST`.
- `"create rejects a case/space duplicate of an active habit"`: create `Read`, then `" read "` → `CONFLICT`, message `You already have a habit called 'Read'.`
- `"archive then create reuses the name"` → succeeds; `list()` returns only the new one; `list({ includeArchived: true })` returns both.
- `"update changes category without touching past completions"`: insert a completion for the habit with `category_id: "mind"`, update to `body`, then read the completion row → still `"mind"`.
- `"cannot update or archive another user's habit"` → `NOT_FOUND`.
- `"list orders mind, body, soul then oldest first"`.

- [ ] **Step 2: Run them to make sure they fail** (Run: `pnpm vitest run apps/api/test/habit.test.ts`. Expected: FAIL), **then implement**: map Postgres `23505` from the partial index to the `CONFLICT` error, looking up the clashing habit's stored name for the message. **Rerun.** Expected: PASS.

- [ ] **Step 3: Commit** `git commit -m "feat(api): habit router"`.

---

### Task 6: `completion` and `mood` routers

**Files:**
- Create: `apps/api/src/trpc/routers/{completion,mood}.ts`, `src/trpc/dates.ts`
- Modify: `apps/api/src/trpc/root.ts`
- Test: `apps/api/test/completion.test.ts`, `test/mood.test.ts`

**Interfaces:**
- Consumes: `Context.now`, `isLocalDate`, `addDays`, `daysBetween`, `computeStats`, `Stats`.
- Produces:
  - `localDateInput`: a zod string refined with `isLocalDate`. `assertPlausibleToday(today: LocalDate, now: Date)` throws `BAD_REQUEST` `Your computer's date looks off.` unless `|daysBetween(utcDateOf(now), today)| ≤ 1`.
  - `assertBackfillable(date, today)` throws `BAD_REQUEST` `You can only ink today or yesterday.` unless `date ∈ { today, addDays(today, -1) }`.
  - `completion.ink: mutation({ habitId; date; today }) → { inked: true; alreadyInked: boolean; habitId; date; categoryId }`. It snapshots the habit's **current** category. Archived or foreign habit → `NOT_FOUND`. Idempotent: uses `onConflictDoNothing` on `(habit_id, date)`.
  - `completion.unink: mutation({ habitId; date; today }) → { removed: boolean }` (same date rules).
  - `completion.today: query({ today }) → Array<Habit & { inked: boolean }>` (active habits only, `habit.list` ordering).
  - `completion.range: query({ from; to }) → Array<{ date: LocalDate; categoryId: CategoryId; habitId: number }>`, inclusive, including archived habits' completions. `to − from` ≤ 400 days, otherwise `BAD_REQUEST`.
  - `completion.stats: query({ today }) → Stats` (all of the user's completions, `activeHabitCount` = active habits).
  - `mood.set: mutation({ date; today; level: 1..5 }) → { date; level }` (upsert; same date rules). `mood.get: query({ date }) → { date; level } | null`.

- [ ] **Step 1: Write failing tests.** Fix `now` to `2026-11-09T12:00:00Z` through `callerFor(db, userId, () => now)`.

`completion.test.ts`:
- `"inks today and snapshots the category"`.
- `"inking twice reports alreadyInked and stores one row"` (Review Focus 3).
- `"accepts today from UTC+14 and UTC-12"`: `today: "2026-11-10"` and `"2026-11-08"` both succeed (Review Focus 1).
- `"rejects a today two days from the server's UTC date"`: `"2026-11-11"` → `BAD_REQUEST`, message `Your computer's date looks off.`
- `"inks yesterday but not the day before"`: `date: "2026-11-08"` succeeds; `"2026-11-07"` fails with `You can only ink today or yesterday.`
- `"rejects a malformed date"`: `"2026-11-9"` → `BAD_REQUEST`.
- `"cannot ink an archived habit"` → `NOT_FOUND`.
- `"range includes archived habits' history"`.
- `"range rejects more than 400 days"`.
- `"stats uses the client's today"`: completions on 11-08 and 11-09 with `today: "2026-11-09"` give `currentStreak: 2`.

`mood.test.ts`:
- `"set upserts one mood per day"`: set 3, then 5 → `get` returns 5.
- `"rejects level 0 and 6"`.
- `"cannot set a mood two days back"`.

- [ ] **Step 2: Run them to make sure they fail** (Run: `pnpm vitest run apps/api/test/completion.test.ts apps/api/test/mood.test.ts`. Expected: FAIL), **implement, then rerun.** Expected: PASS.

- [ ] **Step 3: Commit** `git commit -m "feat(api): completion and mood routers with local-date rules"`.

---

### Task 7: Better Auth and the browser pages

**Files:**
- Create: `apps/api/src/auth.ts`, `src/pages/{layout,home,privacy,signin}.ts`
- Modify: `apps/api/src/app.ts` (mount `/api/auth/*`, `/`, `/privacy`, `/signin`, and `/squid.png` from `public/`)
- Test: `apps/api/test/pages.test.ts`

**Interfaces:**
- Consumes: `Db`, `loadEnv`.
- Produces:
  - `createAuth(db: Db, env: Env): AppDeps["auth"]`: `betterAuth({ database: drizzleAdapter(db, { provider: "pg", schema: authSchema, transaction: false }), baseURL: env.BETTER_AUTH_URL, secret: env.BETTER_AUTH_SECRET, socialProviders: { google: {...}, github: {...} } })`. Use `transaction: false` because neon-http has no interactive transactions. If the installed adapter's options don't include it, check that the adapter makes no transaction calls and drop the option. `getSessionUser` wraps `auth.api.getSession({ headers })`.
  - `layout(title: string, body: string): string`: a full HTML page on the lavender ground `#be9fe0` with ink `#31356b`, `/squid.png` at the top, system font stack, no external requests.
  - `GET /signin?next=<path>` renders "Sign in to Squii" with **Continue with Google** and **Continue with GitHub** buttons. A ~10-line inline script POSTs `/api/auth/sign-in/social` with `{ provider, callbackURL: next }` and navigates to the returned `url`. `next` must start with `/` and not `//`; otherwise it falls back to `/`.
  - `GET /`: what Squii is (one sentence from the spec §1) and `npm i -g squii`. `GET /privacy`: what's stored (account name and email, habits, ticks, moods) and that nothing is shared or sold.

- [ ] **Step 1: Write failing tests** `test/pages.test.ts`:
- `"home shows the install command"`: GET `/` → 200, `text/html`, body contains `npm i -g squii`.
- `"privacy page exists"` → 200.
- `"signin ignores an off-site next"`: GET `/signin?next=//evil.example` → the body's embedded `callbackURL` is `"/"`.
- `"no page contains 'missed'"`: across `/`, `/privacy`, `/signin`.

- [ ] **Step 2: Run them to make sure they fail, implement, then rerun.** Run: `pnpm vitest run apps/api/test/pages.test.ts`. Expected: FAIL, then PASS.

- [ ] **Step 3: Commit** `git commit -m "feat(api): Better Auth with Google/GitHub and public pages"`.

---

### Task 8: The CLI auth handshake (`/cli/*`)

**Files:**
- Create: `apps/api/src/cli-auth/routes.ts`, `src/pages/{cli-confirm,cli-done}.ts`
- Modify: `apps/api/src/cli-auth/crypto.ts` (add `verifyPkce`), `src/cli-auth/store.ts` (add the functions below and sliding expiry to `resolveCliToken`), `src/app.ts` (mount routes)
- Test: `apps/api/test/cli-auth.test.ts`

**Interfaces:**
- Consumes: `AppDeps.auth.getSessionUser`, `cli_auth_code`, `cli_token`, `layout`.
- Produces:
  - `verifyPkce(verifier: string, challenge: string): boolean` (S256, constant-time compare), alongside Task 4's `sha256Base64Url` and `randomToken`.
  - `createAuthCode(db, userId, challenge, now): Promise<string>` (raw code; stores its hash; expires `now + 60s`), `redeemAuthCode(db, code, verifier, now): Promise<string | null>` (userId; **deletes the row on any redemption attempt**, so a code is single-use even if the verifier is wrong).
  - `issueCliToken(db, userId, now): Promise<string>`: returns `sq_` + `randomToken()` and stores its hash, `expires_at = now + 180 days`. `resolveCliToken(db, raw, now): Promise<string | null>`: on success, if `last_used_at` is more than 1 day old, slides `expires_at` to `now + 180 days` and updates `last_used_at`. `revokeCliToken(db, raw): Promise<void>`.
  - Routes:
    - `GET /cli/authorize?code_challenge&code_challenge_method=S256&state&redirect_uri`: validates (method `S256`; challenge matches `^[A-Za-z0-9_-]{43}$`; `state` 16–128 chars; `redirect_uri` exactly `http://127.0.0.1:<port>/callback` or `http://localhost:<port>/callback`), otherwise 400 with a plain page. With no session → 302 to `/signin?next=<this URL, encoded>`. With a session → renders the confirm page: "Sign in to Squii in your terminal as <name>?" with a **Continue** button (a form POST carrying the four params).
    - `POST /cli/authorize`: same validation plus the session (the Better Auth cookie is `SameSite=Lax`, so cross-site POSTs arrive without it and get the sign-in redirect). Then 302 to `<redirect_uri>?code=<code>&state=<state>`.
    - `POST /cli/token` JSON `{ code, code_verifier }` → 200 `{ token, user: { name, email } }`, or 400 `{ error: "invalid_grant" }`.
    - `POST /cli/revoke` with a bearer token → 204, revoking it (204 even if it's unknown).
    - `GET /cli/done`: "You're in. You can close this tab and head back to your terminal." with Squii.

- [ ] **Step 1: Write failing tests** `test/cli-auth.test.ts` (`now` injectable; a fake `getSessionUser` reads an `x-test-user` header):
- `"verifyPkce matches the RFC 7636 Appendix B example"`: `verifyPkce("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk", "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")` is `true`, and with the last character of the verifier changed it is `false`.
- `"authorize without a session redirects to signin with next"`.
- `"authorize rejects a non-loopback redirect_uri"`: `https://evil.example/callback` → 400.
- `"authorize rejects plain method"`: `code_challenge_method=plain` → 400.
- `"POST authorize redirects to the loopback with code and state"`.
- `"token exchange succeeds once"`: then the same code again → `invalid_grant` (Review Focus 4).
- `"token exchange fails with the wrong verifier and burns the code"`: a wrong verifier, then the right one → both `invalid_grant`.
- `"token exchange fails after 60 seconds"`: advance `now` by 61 s → `invalid_grant`.
- `"issued token works for whoami, and revoke ends it"`.
- `"token slides its expiry when used after a day"`: issue at `t`, resolve at `t + 2 days` → `expires_at = t + 2 days + 180 days`.

- [ ] **Step 2: Run them to make sure they fail, implement, then rerun.** Run: `pnpm vitest run apps/api/test/cli-auth.test.ts`. Expected: FAIL, then PASS.

- [ ] **Step 3: Commit** `git commit -m "feat(api): CLI PKCE handshake and Squii tokens"`.

---

### Task 9: CLI package, credentials, API client, friendly errors

**Files:**
- Create: `packages/cli/{package.json,tsconfig.json,tsup.config.ts}`, `src/version.ts`, `src/config/{paths,credentials}.ts`, `src/api/{client,errors}.ts`, `src/index.ts`
- Test: `packages/cli/test/{credentials,errors}.test.ts`

**Interfaces:**
- Consumes: `import type { AppRouter } from "@squii/api/router"` (add `exports["./router"]` pointing at `src/trpc/root.ts` in `@squii/api`; the CLI lists `@squii/api` as a **devDependency** only).
- Produces:
  - `package.json`: name `squii`, `version` `0.1.0`, `bin: { "squii": "dist/index.js" }`, `files: ["dist"]`, engines `>=22.12.0`, deps `@trpc/client`, `superjson`, `commander`, `@clack/prompts`, `open`. `@squii/core` is bundled by tsup (`noExternal: ["@squii/core"]`). The tsup banner is `#!/usr/bin/env node`.
  - `VERSION: string` (read from package.json at build time via tsup `define`), `apiUrl(): string` (`SQUII_API_URL` or `https://northstar-one.vercel.app`).
  - `configDir(env = process.env, home = os.homedir()): string`.
  - `type Credentials = { apiUrl: string; token: string; user: { name: string; email: string }; createdAt: string }`, `readCredentials(): Promise<Credentials | null>` (null if the file is missing or unparseable), `writeCredentials(c): Promise<void>` (atomic: temp file + rename; dir `0700`, file `0600`), `deleteCredentials(): Promise<void>`.
  - `createApiClient(opts: { baseUrl: string; token?: string }): TRPCClient<AppRouter>`: `httpBatchLink` to `${baseUrl}/trpc`, `superjson`, headers `authorization` (if a token is set) and `x-squii-version: VERSION`. Its custom `fetch` throws `UpgradeRequiredError` on a 426 response before tRPC parses it.
  - `class SquiiError extends Error {}` (its message is already user-facing), `class UpgradeRequiredError extends Error { minVersion: string }`, `toFriendlyMessage(err: unknown, ctx: { signedIn: boolean }): string`.
  - Program: `commander` with `--debug` (also `SQUII_DEBUG=1`) and `--version`. A top-level runner catches everything, prints `toFriendlyMessage`, sets exit code 1, and prints the stack only in debug mode.

- [ ] **Step 1: Write failing tests**

`credentials.test.ts` (with a temp `XDG_CONFIG_HOME`):
- `"configDir honours XDG_CONFIG_HOME, else ~/.config/squii"`.
- `"write then read round-trips"`.
- `"file is 0600 and dir is 0700"` (`fs.stat(...).mode & 0o777`).
- `"a corrupt file reads as null"`.
- `"write leaves no temp file behind"`.

`errors.test.ts`, asserting `toFriendlyMessage` output **exactly**:
- a `TRPCClientError` with `data.code === "UNAUTHORIZED"` and `signedIn: false` → `You're not signed in yet. Run \`squii login\`.`
- the same with `signedIn: true` → `You've been signed out. Run \`squii login\`.`
- a `TypeError("fetch failed")` with cause code `ENOTFOUND` or `ECONNREFUSED` → `Squii can't reach the internet right now.`
- `new UpgradeRequiredError("0.2.0")` → `A newer Squii is out (0.2.0). Run \`npm i -g squii@latest\`.`
- `new SquiiError("x")` → `x`.
- a `TRPCClientError` with a `CONFLICT` or `BAD_REQUEST` message → that server message unchanged.
- anything else → `Something went wrong on Squii's side. Try again in a moment.`

- [ ] **Step 2: Run them to make sure they fail, implement, then rerun.** Run: `pnpm vitest run packages/cli`. Expected: FAIL, then PASS.

- [ ] **Step 3: Verify the build has no forbidden imports**

Run: `pnpm --filter squii exec tsup && ! grep -E "drizzle-orm|@neondatabase|better-auth" packages/cli/dist/index.js && node packages/cli/dist/index.js --version`
Expected: build succeeds, grep finds nothing, prints `0.1.0`.

- [ ] **Step 4: Commit** `git commit -m "feat(cli): package, credentials store, API client and friendly errors"`.

---

### Task 10: `squii login`, `logout`, `whoami`, with an end-to-end test

**Files:**
- Create: `packages/cli/src/auth/{pkce,loopback,login}.ts`, `src/commands/{login,logout,whoami}.ts`, `apps/api/src/dev.ts`
- Modify: `packages/cli/src/index.ts` (register commands; bare `squii` prints help until Plan 3)
- Test: `packages/cli/test/{pkce,loopback}.test.ts`, `packages/cli/test/login.e2e.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 8–9.
- Produces:
  - `createPkcePair(): { verifier: string; challenge: string }` (verifier = 32 random bytes as base64url, 43 chars).
  - `startLoopback(opts: { state: string; timeoutMs: number; doneUrl: string }): Promise<{ port: number; redirectUri: string; code: Promise<string>; close(): Promise<void> }>`. It binds `127.0.0.1` on port 0. On `/callback` with the matching `state` it 302s to `doneUrl` and resolves `code`. A mismatched `state` gets a 400 page and rejects with `SquiiError("That sign-in link didn't match. Run \`squii login\` again.")`. On timeout it rejects with `SquiiError("Sign-in timed out. Run \`squii login\` when you're ready.")`. It closes itself after settling either way.
  - `login(deps: { apiUrl: string; openBrowser(url: string): Promise<void>; print(line: string): void; timeoutMs?: number }): Promise<Credentials>`. `timeoutMs` defaults to `300_000`. The function always prints the authorise URL as a fallback line, saves credentials only after a successful token exchange, and prints `Signed in as <name>. Welcome to Squii!`.
  - `squii logout`: POSTs `/cli/revoke` (ignoring network errors), deletes the credentials, and prints `Signed out. See you soon.`. If already signed out it prints `You're not signed in.` and exits 0.
  - `squii whoami` prints `<name> (<email>)` using `me.whoami`.
  - `apps/api/src/dev.ts` serves `createApp` with `@hono/node-server` on `PORT` (default `8787`) using a real `.env`. Root script: `pnpm dev:api`.

- [ ] **Step 1: Write failing unit tests**

`pkce.test.ts`: `"verifier is 43 base64url chars and challenge is its S256"` (recompute the S256 with `node:crypto` in the test).

`loopback.test.ts`:
- `"resolves the code on a matching state and redirects to doneUrl"`.
- `"rejects on a state mismatch"`.
- `"times out and frees the port"` (`timeoutMs: 50`; then `net.connect(port)` fails).

- [ ] **Step 2: Write the failing end-to-end test** `login.e2e.test.ts`

Import from `@squii/api/testing`. Start `createApp` on a random port with `serve()` from `@hono/node-server`, using `createTestDb()` and a fake `getSessionUser` that returns a seeded user when the `x-test-user` header is present. Point `XDG_CONFIG_HOME` at a temp dir. The fake `openBrowser(url)` plays the browser: GET the URL with `x-test-user`, POST the confirm form, follow the 302 to the loopback, and follow that to `/cli/done`. Assertions:
- `"login saves credentials and whoami works"`: `readCredentials()` returns the token, and a client built from it gets `me.whoami` with the seeded name.
- `"logout revokes the token server-side"`: after logout, a client using the old token gets `UNAUTHORIZED`, and the credentials file is gone.
- `"abandoned login times out without writing credentials"`: `openBrowser` does nothing and `timeoutMs: 100` → rejects with the timeout sentence, and `readCredentials()` is `null` (Review Focus 5).

- [ ] **Step 3: Run them to make sure they fail**

Run: `pnpm vitest run packages/cli`
Expected: FAIL.

- [ ] **Step 4: Implement** `pkce.ts`, `loopback.ts`, `login.ts`, the three commands and `dev.ts`. Wire `openBrowser` to the `open` package. If it throws, swallow the error, because the fallback line is already printed.

- [ ] **Step 5: Run everything**

Run: `pnpm test && pnpm typecheck`
Expected: all PASS, typecheck exits 0.

- [ ] **Step 6: Commit** `git commit -m "feat(cli): squii login/logout/whoami over PKCE loopback"`.

---

### Task 11: Deploy and the real sign-in check (Freddy + agent)

Steps marked **Freddy** need his accounts, so the agent stops and asks for each one. Everything else is the agent's.

**Files:**
- Create: `apps/api/src/index.ts` (Vercel entry: `export default createApp({ db: createDb(env.STORAGE_DATABASE_URL), auth: createAuth(...), minCliVersion: env.MIN_CLI_VERSION, publicUrl: env.BETTER_AUTH_URL })`), `apps/api/vercel.json` only if the Hono preset needs it, `docs/deploy.md` (these steps, written down)

- [ ] **Step 1 (Freddy): Claim the npm name.** Run `npm login`, then publish a placeholder: `squii@0.0.1` with a README line "coming soon". Check: `npm view squii name` prints `squii`.
- [ ] **Step 2 (Freddy): Create a GitHub OAuth app.** Homepage `https://northstar-one.vercel.app`, callback `https://northstar-one.vercel.app/api/auth/callback/github`. For local dev, create a second app with callback `http://localhost:8787/api/auth/callback/github`.
- [ ] **Step 3 (Freddy): Update the Google OAuth client.** Add the redirect URIs `https://northstar-one.vercel.app/api/auth/callback/google` and `http://localhost:8787/api/auth/callback/google`. Set the consent screen's homepage to `/` and its privacy policy to `/privacy`, then publish it to production.
- [ ] **Step 4 (Freddy): Update the Vercel project.** Set the root directory to `apps/api` and the framework preset to Hono. Env vars: `STORAGE_DATABASE_URL` (existing), `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL=https://northstar-one.vercel.app`, `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `MIN_CLI_VERSION=0.1.0`.
- [ ] **Step 5 (agent, after Freddy confirms the wipe again): Reset the database.** Drop the old `northstar_*` tables, then run `pnpm --filter @squii/api exec drizzle-kit migrate`. Check: `\dt` lists exactly `user, session, account, verification, habit, completion, mood, cli_auth_code, cli_token` plus drizzle's migrations table.
- [ ] **Step 6 (agent): Deploy and smoke-test.** Push the branch and let Vercel build a preview, or ask Freddy to promote it. Check: `curl -s https://northstar-one.vercel.app/ | grep "npm i -g squii"` matches, and `curl -s -o /dev/null -w "%{http_code}" -H "x-squii-version: 0.0.1" https://northstar-one.vercel.app/trpc/me.whoami` prints `426`.
- [ ] **Step 7 (Freddy, agent watching): Real sign-in.** Run `node packages/cli/dist/index.js login`. The browser opens, you sign in with Google, then Continue, then "You're in". Check: `node packages/cli/dist/index.js whoami` prints your name and email. Repeat with GitHub after `logout`.
- [ ] **Step 8: Commit** `git commit -m "chore(api): Vercel entry and deploy notes"`.
