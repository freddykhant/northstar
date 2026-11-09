# Squii CLI: Design

**Status:** Reviewed by a builder check; awaiting Freddy's approval
**Date:** 2026-11-09
**Supersedes:** the Next.js web app as the product. The brand rules in
`2026-08-26-squii-brand-design.md` (mascot, palette, expressions, motion
principle) still stand. Its *surfaces* section (landing page, auth pages)
does not apply here.

Markers used below: **(Freddy)** = decided by Freddy in conversation.
**(call)** = a call made while writing this, open to override. Anything
unmarked follows directly from one of those two.

---

## 1. Intent

Squii, formerly Northstar, is a habit tracker built around a
GitHub-contributions-style graph of your year, in three categories: **mind,
body, soul**. It is being rebuilt from a Next.js web app into a **CLI-first
tool**. You install it from npm and live in it from the terminal, and it can
also serve a calm local web dashboard on a localhost port.

**Why (Freddy):** habit-tracker web apps are a saturated space, and Freddy
loves minimal CLI tools that are also beautiful to use. A small, crafted
terminal tool is more distinctive than one more web app. The local web page is
a bonus view, not the main event.

**Who it's for (Freddy):** Freddy first, then friends, then real users. "E2E"
means a working product with real people on real accounts. It does not mean
end-to-end encryption.

**Tone (Freddy):** lighthearted and fun. Squii is a character, and the
commands should have some play in them.

**The philosophy doesn't change (Freddy):** three categories, the graph at the
centre, and the core loop: open → see today → tick what you did → watch the
graph light up.

## 2. Goals, non-goals, anti-goals

**Goals for v1**
- `npm i -g squii` → `squii hello` → signed in → first habit → first tick,
  all smooth on a clean Mac or Linux machine.
- A live, interactive `squii hello` session that feels like Claude Code:
  greeting animation, graph, today's check-in, and a command line.
- A full one-shot command set (§4.4) that works straight from the shell.
- `squii web`: a calm local dashboard backed by the same account. **In the
  first release, and simple to start** (Freddy).
- Real multi-user accounts via browser OAuth with PKCE.

**Pace (Freddy):** there's no date, but ship fast. Everything in this document
is in the first release. Suggested build order, so there's always something
working to try (call):
1. `core` + API + schema + loopback login
2. One-shot commands
3. The `squii hello` session and graph
4. `squii web`
5. The SSH paste-code fallback and the full manual terminal pass before
   publishing

**Non-goals for v1**
- Windows support (Freddy: "later"). Don't make choices that make it hard,
  such as hard-coded `/` paths or Unix-only shell tricks.
- Migrating existing data. There are no users to keep, so the database can be
  wiped and the schema redesigned from scratch (Freddy).
- Working offline or queueing writes for later (call). Commands that need the
  network fail with one plain sentence.
- New roadmap features (social, streak milestones, etc.). Freddy wants to
  revisit the roadmap for the new vision, but **as a separate conversation
  after v1 is designed**. The old ROADMAP.md "won't build" list was for the
  web app and is not a permanent constraint. For v1 the scope is this
  document.
- The old public landing page and the Next.js app. Both go away.

**Anti-goals: what would make Freddy wince (Freddy)**

Anything broken at the core:
- Terminal UI that renders badly: misaligned columns, stray spaces or
  newlines, text jumping around while you type, flicker.
- A graph that doesn't render properly.
- A startup animation that looks horrible.
- Commands that don't work.
- Auth that bugs out.
- `npm install` that doesn't work.

**Polish and robustness beat feature count.** If something can't be made
solid in time, cut it.

## 3. Brand rules that carry over

From the Squii brand spec, unchanged:
- Squii's colours (body `#fdb6c0`, ink `#31356b`, ground `#be9fe0`) are
  **brand colours and never encode a category**.
- Category colours are fixed. Light: mind `#6c5ce7`, body `#f2542d`, soul
  `#0fa47f`, perfect `#d4a017`. Dark: mind `#9c8fff`, body `#ff7d5c`, soul
  `#35c9a3`, perfect `#ffce54`, empty tile `#26242f`. Source of truth:
  `src/styles/globals.css`, `src/lib/constants.ts`. The terminal supports
  **both palettes** (call). It detects a light or dark background where the
  terminal reports one (e.g. `COLORFGBG`, or an OSC 11 query with a short
  timeout), falls back to dark, and accepts `SQUII_THEME=light|dark` as an
  override. Snapshot baselines exist for both.
- Expressions: **resting, shy, gold, wave.** **Squii has no sad face** and
  never reacts to failure. No "you missed X days" message may ever appear.
- Motion principle: **Squii moves only in response to something you did.** No
  idle bobbing or ambient animation. Opening Squii with `squii hello` counts as
  something you did, so the greeting animation is in (Freddy).
- Gold is earned: at most once a day, on a perfect day (all three categories
  kept).
- In the terminal, Squii is drawn as block-character pixel art built from the
  existing geometry in `src/lib/squii.ts` (call; exact art left to the
  builder). He must look good, not merely recognisable. See §2 anti-goals.

## 4. The experience

### 4.1 First run (Freddy, with calls marked)

1. `npm i -g squii` (or `npx squii@latest`).
2. `squii hello` (or bare `squii`, which is the same thing (call)).
3. Squii greets you with the animation and the `squii` wordmark.
4. A **demo year** fills the graph so you see what it could become. It
   **blips, then clears** to your own empty year.
5. Below it: a few lines of friendly, plain-language instructions, each paired
   with the command to type (`squii add …`, `squii ink …`, `squii help`).
6. Sign-in happens here (call): a line like "first, let's get you a home:
   press enter" runs the login flow (§5.3). You come back signed in, still in
   the session.
7. You add your first habit and tick it.

The demo year plays once, on the first run on a machine, tracked by a local
flag (call). After that, an account with no habits shows an empty graph plus
the instructions.

### 4.2 The `squii hello` session

A live, full-screen-ish terminal UI that redraws as you type, not a series of
prompts (Freddy agreed: **Ink** for this screen).

Top to bottom (call on exact layout):
- **Greeting:** Squii + wordmark + a short hello (with the user's first name if
  known). After **3+ days without a check-in**, the greeting is the slower,
  warmer *wave* (the brand spec's "comeback"). It is never guilt-tripping.
- **The graph** (§4.3), striped view by default. **`tab` toggles** to the lanes
  view (Freddy agreed).
- **Today's check-in:** active habits grouped under mind / body / soul. Ticking
  one inks it immediately: the day's stripe lights up. Keeping all three
  categories turns Squii gold, once a day.
- **A command line** at the bottom with a short hint. You can type any command
  from §4.4 with or without the `squii` prefix (call; Freddy agreed).
- **Mood** is offered as an optional one-tap 1–5 at the end of a check-in, and
  is easy to skip (call; Freddy agreed).

Leaving (`ctrl+c`, `exit`, or `q` when the command line is empty) quits
cleanly and leaves the graph printed in the scrollback (call).

Keyboard details (moving through habits, the key that ticks) are left to the
builder. They must be discoverable from the on-screen hint.

### 4.3 The graph (Freddy chose A as default, with C as a toggle)

**A: striped day (default).** Each day is **2 terminal columns**, drawn as
three thin vertical stripes in fixed order **mind | body | soul**, plus a
one-stripe gap:

- column 1: `▌` with foreground = mind, background = body
- column 2: `▌` with foreground = soul, background = terminal default (the gap)

A kept category's stripe is its colour. A missed category's stripe is the
empty-tile colour. A **perfect day turns all three stripes gold.** Weekday rows
are separated by a blank line so the same weekday in neighbouring weeks
doesn't merge into continuous bars. A full year is about 106 columns wide.

Why stripes: the web mosaic's rule is that **position encodes category and
colour only reinforces it** (`src/lib/mosaic.ts`). Stripes keep that rule, so
the graph stays readable in 256-colour terminals, under `NO_COLOR`, and for
colourblind users.

**C: lanes (toggle).** Three small graphs stacked, one per category, labelled.
Each character packs two days (`▀`: top half = one day, bottom half = the
next), so a full year per lane is 53 columns × 4 lines. Each kept day shows its
category colour; missed days show the empty-tile colour. Freddy: "a very
intuitive way to show individual categories."

The approved mockup of both views is in
`.superpowers/brainstorm/51515-1794186444/content/graph-split.html`
(gitignored; local only).

**Width:** when the terminal is too narrow for a full year, show **fewer, most
recent weeks** rather than wrapping (call). Resizing redraws cleanly.

**Colour fallback:** truecolor when supported, the nearest 256-colour values
otherwise. Respect `NO_COLOR`: stripes still render with position carrying
meaning, using dim/bright or a filled/hollow glyph (builder's choice). When
output is not a terminal (piped or redirected), print no escape codes and no
animation.

### 4.4 Commands

All commands work as one-shots from the shell and inside the session.

| Command | Behaviour |
|---|---|
| `squii` / `squii hello` | The interactive session (§4.2). (Freddy) |
| `squii add` | Add a habit. One line: `squii add "read 10 pages" mind`. Or step by step: name, then pick a category. (Freddy) |
| `squii remove <habit>` | **Asks to confirm.** The habit stops appearing in check-in, and **its past days stay inked on the graph** (Freddy: "shouldn't necessarily delete the habit graph entries"). It's archived, not hard-deleted (call). |
| `squii update <habit>` | Rename it or change its category. **History is preserved:** past days keep the category they were inked under, and only future ticks use the new one (call; Freddy agreed). |
| `squii ink <habit>` | Tick a habit off for today without opening the session. Fuzzy-matches the name; if more than one habit matches, asks which. `--yesterday` back-fills yesterday. (call; Freddy agreed) |
| `squii undo` | Un-inks the most recent tick made from this machine (call; Freddy agreed). |
| `squii year` | Prints the graph and exits. `--lanes` for view C. (call; Freddy agreed) |
| `squii week` | A gentle 7-day recap, e.g. "you showed up 5 of 7 days". Never scolding. (call; Freddy agreed) |
| `squii mood [1-5]` | Set today's optional mood. With no number, asks for one. (Freddy) |
| `squii quote` | The quote of the day (Freddy). From a curated list bundled with the CLI, the same for everyone on a given date (call). |
| `squii web` | Starts the local dashboard (§4.5) and opens the browser. (Freddy) |
| `squii boop` | Squii goes shy and covers his eyes. Pure delight. (call; Freddy agreed) |
| `squii login` / `logout` / `whoami` | Account commands. (call; Freddy agreed) |
| `squii help` | Plain-language help with examples. |
| `squii prompt` | **Stretch.** Prints a tiny three-stripe glyph for today, for use in a shell prompt. Cut it if time is short. |

Back-filling is limited to **today and yesterday** in v1 (call). This keeps it
honest and keeps the `--yesterday` path simple.

Habit names are **unique per user among active habits**, case-insensitive
(call). Fuzzy matching needs this.

Every error is **one plain sentence plus the command that fixes it**, never a
stack trace. Examples: not signed in → "You're not signed in yet. Run `squii
login`."; offline → "Squii can't reach the internet right now."; no match →
"No habit called 'raed'. Did you mean 'read'?". A `--debug` flag or
`SQUII_DEBUG=1` shows details (call).

### 4.5 The local web dashboard (`squii web`)

A **calm cockpit / home screen** (Freddy), essentially a simplified version of
the existing `/home` page. **Simple to start** (Freddy). v1 shows:
- the graph (the real diagonal tiles here, since a browser can draw them)
- today's habit checklist (ticking works)
- key metrics: current streak, best streak, this week %, total (from the
  existing stats logic)
- the quote of the day
- today's date and time

The lanes toggle, today's mood, and anything else are later additions (call,
to keep the first version simple).

One screen, no sidebar, no settings. Follows the system light/dark theme.
Built from the existing React pieces where they fit: `src/_components/ui/mosaic/*`,
`checkin-list.tsx`, `primitives/*`, `mood-tracker.tsx`.

How it runs (call):
- The CLI starts a local server on `127.0.0.1` only, on a fixed default port
  with automatic fallback if it's taken, serving the pre-built dashboard
  shipped inside the npm package.
- The local server **proxies** API calls and attaches the user's token, so the
  token never reaches the browser.
- The URL carries a random per-run key, and the server rejects requests
  without it, so other local pages or processes can't drive the proxy. The
  server also checks the `Host` header to block DNS rebinding.
- It stops when you press `ctrl+c` in the terminal that started it.

## 5. How it's built

### 5.1 Shape

```
squii (npm) ──► hosted Squii API (tRPC) ──► Drizzle ──► Neon Postgres
   │                    ▲
   └─ squii web ─ local proxy ┘
```

**The CLI never holds a database connection.** If the Neon connection string
shipped inside the npm package, anyone who installed it could read or wipe
everyone's data. Drizzle + Neon stay, behind the hosted API (Freddy agreed).

**Repo (call):** this repo becomes a pnpm workspace:
- `packages/cli`: the published `squii` package. Ink for the session, clack for
  one-off prompts (`add` step by step, `remove` confirmation, `login`). Bundles
  the built dashboard.
- `apps/api`: the hosted server: tRPC procedures, Better Auth, Drizzle schema
  and migrations.
- `apps/web`: the local dashboard (React; Vite is the obvious choice). Its
  build output is copied into `packages/cli`.
- `packages/core`: shared, dependency-light logic and types: day states and
  stripe/tile logic (from `src/lib/mosaic.ts`), streak and stats maths (from
  `getOverallStats`), category constants and colours, the quote list, date
  helpers.

The Next.js app, NextAuth, the landing page and auth pages are deleted.

**Language and runtime (Freddy):** TypeScript throughout. Node 20+ (call). **No
native dependencies** in the CLI, so install can't fail on a build step.

**Hosting (call):** the API on Vercel with Neon, the stack the repo already
uses (`STORAGE_DATABASE_URL` is the Vercel–Neon integration's variable). It
replaces the current Next.js deployment in the same Vercel project.

**API URL (Freddy):** there's no domain yet. The CLI compiles in
`https://northstar-one.vercel.app`, overridable with `SQUII_API_URL` for
development. When a domain arrives (call): add it to the **same** Vercel
project, **keep the `northstar-one.vercel.app` alias permanently** so
already-installed CLIs keep working, register both origins' OAuth callbacks,
and switch new CLI releases to the domain. No redirect or discovery step is
needed.

**npm name:** `squii` was unclaimed on 2026-11-09. Claim it early.

**Account setup is Freddy's to do, and the plan includes it as explicit
steps** (call): claim the npm name, create the GitHub OAuth app, add the
production callback to the Google OAuth client and move its consent screen to
production, and set up the Vercel project and env vars. Google's production
consent screen needs a homepage and a privacy-policy URL, so the API also
serves **two tiny static pages: a home page (what Squii is + `npm i -g squii`)
and a privacy page** (call). These are not a return of the old landing page.

### 5.2 API

- Keep **tRPC** and move the existing routers (`habit`, `completion`, `mood`,
  `categories`) out of Next.js with their logic largely intact (Freddy: "use as
  much of the backend as possible"). The CLI and dashboard use the tRPC client
  for end-to-end types.
- Every procedure is scoped to the token's user. There are no public data
  procedures.
- **Dates are the user's local calendar date, sent by the client** as
  `YYYY-MM-DD`. The server never works out "today" from its own clock, because
  it runs in UTC and users don't. Today's date is an input to the stats
  procedures, unlike the current `getOverallStats`, which uses `new Date()` on
  the server.
- The CLI sends its version on every request. The server can answer "please
  upgrade" with a minimum version, and the CLI shows it as one friendly line
  with the install command (call). This matters because old copies of the CLI
  will be in the wild.

### 5.3 Auth (Freddy: browser OAuth with PKCE)

- **Better Auth** on the API, with the Drizzle adapter, handles accounts,
  sessions and social sign-in (call).
- **Sign-in options: Google and GitHub.** Email/password is dropped (call;
  Freddy agreed).
- **CLI flow:**
  1. The CLI makes a PKCE verifier and challenge plus a random `state`, and
     starts a one-shot listener on `127.0.0.1:<random port>`.
  2. It opens the browser to the API's CLI-authorise page with the challenge,
     state and loopback redirect. If the browser can't be opened, it prints
     the URL.
  3. The user signs in with Google or GitHub. The API issues a **single-use
     code that expires within about a minute**, bound to the challenge, and
     redirects to the loopback address. The browser shows a friendly "you can
     close this tab" page with Squii on it.
  4. The CLI checks `state` and exchanges code + verifier for a **long-lived,
     revocable session token**.
  5. The token is stored in `$XDG_CONFIG_HOME/squii/` (default
     `~/.config/squii/`) with permissions readable only by the user.
- The API accepts **only loopback redirect URIs** for this flow.
- **Over SSH or without a local browser** (Linux friends on a remote box): the
  loopback redirect can't reach the CLI. Offer a fallback where the success
  page shows a short code to paste into the terminal (call).
- `logout` revokes the token on the server and deletes it locally.
- An expired or revoked token gives one line, "You've been signed out. Run
  `squii login`.", never a crash.

### 5.4 Data model (wipe allowed; redesign freely)

Drop the `northstar_` table prefix, the NextAuth tables and the `password`
column. Better Auth supplies its own user, session and account tables.

- **habits:** user, name, current category, `archivedAt` (null = active;
  replaces `isActive`), created/updated timestamps.
- **completions:** habit, user, local date, and **the category at the time of
  the tick**. This snapshot is what lets `update` change a habit's category
  without recolouring history (§4.4), and lets the graph read days directly. It
  stays unique on (habit, date).
- **moods:** user, local date, level 1–5, unique on (user, date). Same as
  today.
- **Categories:** fixed in code as `mind | body | soul`, or kept as a table.
  Builder's choice.

`remove` sets `archivedAt` and never deletes completions. Hard delete is not in
v1.

## 6. Quality bar: what "done" means

This is the core of the anti-goals (§2).

- **Exact rendering.** Snapshot tests of rendered frames for the session, the
  graph (both views), and each command's output, at **80, 110 and 160
  columns**. No stray blank lines, trailing spaces that wrap, or input fields
  that jump while you type.
- **A manual pass in real terminals** before any release: macOS Terminal.app,
  iTerm2, Ghostty, the VS Code terminal, GNOME Terminal on Linux, and inside
  tmux. Check truecolor, 256-colour and `NO_COLOR`, light and dark terminal
  themes, and window resizing during the session.
- **Animation.** The greeting is short (about a second), smooth, and skipped by
  any key press. It doesn't play when output isn't a terminal or when
  reduced-motion is requested (`SQUII_REDUCED_MOTION=1` (call)). In that case
  Squii still appears, just without the performance.
- **Install.** CI packs the real tarball and installs it globally into a clean
  environment on **macOS and Ubuntu**, then runs `squii --version`, `squii
  help`, and `squii year` against a test API. No postinstall scripts.
- **Commands run for real.** An end-to-end suite runs every command against a
  test API with a throwaway Neon branch, including the error paths: signed
  out, offline, no matching habit, several matching habits, and an already
  inked day.
- **Auth.** Tested end to end: the loopback flow, the paste-code fallback, an
  expired token, logout/revoke, and a bad or mismatched `state`.
- **Unit tests** for `packages/core`: all eight day states → stripes, streak
  and week-% maths with local dates across month and year boundaries, fuzzy
  matching, and the quote-of-the-day pick.

## 7. Constraints

- Mac and Linux for v1. Windows later (Freddy).
- TypeScript. Ink + clack in the CLI. Drizzle + Neon behind the API. tRPC.
- No database credentials in anything shipped to users.
- The brand rules in §3 are non-negotiable, especially no sad face.

## 8. Left to the builder

- Exact screen layout and keys inside `squii hello`, as long as the hint makes
  them discoverable.
- Squii's pixel art and animation frames, the wordmark rendering in the
  terminal, and exact copy and microcopy (lighthearted, never scolding).
- The quote list's contents (light, warm, not cheesy).
- The dashboard's exact layout, within "calm cockpit, one screen".
- Library choices inside the stated stack: CLI argument parsing, bundling,
  test tools, and the server framework hosting tRPC on Vercel.
- The default port for `squii web`.
- Whether categories live in a table or only in code.
