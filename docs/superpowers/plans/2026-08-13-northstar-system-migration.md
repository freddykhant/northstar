# Northstar Design-System Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the warm-paper design entirely — migrate the four remaining surfaces onto the mosaic design system, clear the accessibility gaps and dead components it left behind, then delete the `DEPRECATED` token block and Fraunces.

**Architecture:** No new abstractions. This applies the system built in the mosaic redesign (`docs/superpowers/plans/2026-08-10-northstar-mosaic-redesign.md`) to the surfaces that were deliberately left out of scope. The last task removes the compatibility layer that existed only for them, which is the real proof the migration is complete.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, tRPC v11, framer-motion v12, Vitest, pnpm.

## Global Constraints

- **The canonical token mapping**, applied everywhere:
  | Old | New |
  |---|---|
  | `--color-paper-raised`, `--color-paper-dark-raised` | `--color-surface` |
  | `--color-paper`, `--color-paper-dark` | `--color-canvas` |
  | `--color-ink-dark` | `--color-ink` |
  | `--color-ink-dark-muted` | `--color-ink-muted` |
  | `--color-ember`, `--color-ember-soft` | `--color-mind` (primary accent) |
  | `border-black/8`, `dark:border-white/8`, `--color-hairline-dark` | `border-[var(--color-hairline)]` |
  | `rounded-[12px]` and similar card radii | `rounded-[var(--radius-card)]` |
  | `rounded-[6px]` / `rounded-[8px]` controls | `rounded-[var(--radius-control)]` |
- **Delete every `font-serif`, `italic` and `fontOpticalSizing` usage** in migrated files. The serif layer is retired.
- **Use the type scale, not literals:** `text-eyebrow`, `text-title`, `text-stat`, `text-display`. Do not reintroduce ad-hoc pixel sizes that match a token.
  **But:** the scale absorbs *accidental* duplication, not deliberate local sizing. If a site's existing size differs from the token and the difference looks intentional given its neighbours, leave it and say so. (This exact mistake was made and reverted once already, on the mosaic legend.)
- **`dark:` variants are unnecessary and should be removed** as you migrate. Tokens flip via the `.dark` class redefining the custom properties in `globals.css`; a `var(--color-ink)` reference resolves correctly in both themes on its own.
- **Reuse the primitives** — `Card`, `Stat`, `Pill`, `Checkbox`, `SegmentedControl` from `~/_components/ui/primitives`. Do not hand-roll a bordered container where `Card` fits. Equally, do **not** grow a primitive a new prop to force a fit: if a site genuinely needs different markup, leave it bespoke and explain why.
- **Every animation needs a `prefers-reduced-motion` path.**
- **This is a re-skin, not a redesign.** Preserve each page's existing layout, copy, and behaviour. Forms must keep validating, links must keep linking, flows must keep flowing.
- `pnpm check` must exit 0, `pnpm test` must pass, and `pnpm build` must succeed after **every** task. All three are green at the branch point.
- **No co-author or "Generated with" trailer** in any commit message.

---

## File Structure

| File | Change |
|---|---|
| `src/_components/ui/category-badge.tsx` | Delete (dead) |
| `src/_components/ui/category-stat-card.tsx` | Delete (dead) |
| `src/_components/ui/progress-bar.tsx` | Delete (dead) |
| `src/_components/ui/stats-cards.tsx` | Delete (dead) |
| `src/_components/ui/mosaic/mosaic-tile.tsx` | Keyboard affordance |
| `src/_components/ui/mosaic/mosaic.tsx` | Tooltip on focus |
| `src/_components/ui/sidebar.tsx` | `aria-current` |
| `src/app/habits/page.tsx`, `src/_components/ui/habits-list.tsx` | Migrate |
| `src/app/signin/page.tsx`, `src/app/signup/page.tsx` | Migrate |
| `src/app/page.tsx` | Migrate (landing) |
| `src/styles/globals.css`, `src/app/layout.tsx` | Remove the compatibility layer |

---

## Task 1: Clear the dead components and the accessibility gaps

**Files:**
- Delete: `src/_components/ui/category-badge.tsx`, `category-stat-card.tsx`, `progress-bar.tsx`, `stats-cards.tsx`
- Modify: `src/_components/ui/mosaic/mosaic-tile.tsx`, `src/_components/ui/mosaic/mosaic.tsx`, `src/_components/ui/sidebar.tsx`

- [ ] **Step 1: Confirm the four components are dead, then delete them**

They were verified unreachable at merge-base `548dc47` as well, so this branch is not what orphaned them. **Re-verify before deleting** — for each, search for its name across `src/` and confirm the only hits are its own file:

```bash
for f in category-badge category-stat-card progress-bar stats-cards; do
  echo "-- $f:"; grep -rn "$f" src | grep -v "_components/ui/$f"
done
```

Expect no output under any of them. If a name *does* appear, stop and report — do not delete it.

Then `git rm` all four.

- [ ] **Step 2: Give mosaic tiles a keyboard path to their tooltip**

Currently the per-day tooltip is reachable only by mouse, so a keyboard or screen-reader user cannot read any day's detail. This is the most substantive accessibility gap on the branch.

In `mosaic-tile.tsx`, make the tile focusable and fire the same handlers on focus as on hover. Rename the props to reflect that they are no longer mouse-specific (e.g. `onShow`/`onHide` rather than `onEnter`/`onLeave`), and update the three view components that pass them.

The tile also needs an accessible name. `keptLabel()` in `src/lib/mosaic.ts` already produces the right text; combine it with the date, e.g. `aria-label="Sat 9 Aug — Mind, Soul"`.

Two things to get right:
- Only tiles that represent real days should be focusable. The year view renders out-of-range and future days at `opacity: 0` to hold grid position — those must **not** be in the tab order.
- A year of tiles is ~365 tab stops, which is its own accessibility problem. Consider making the grid a single tab stop with arrow-key navigation, or at minimum ensure the surrounding page remains navigable. **If arrow-key navigation looks like more than this task should carry, implement focusability and report that recommendation rather than half-building it.**

- [ ] **Step 3: Show the tooltip on focus**

In `mosaic.tsx`, the tooltip currently positions from `event.clientX/clientY`, which a focus event does not meaningfully provide. Position it from the focused element's bounding box instead, so it works for both input methods. Keep the existing behaviour that switching views clears the tooltip.

- [ ] **Step 4: Mark the active nav link**

In `sidebar.tsx`, add `aria-current="page"` to the active link. Active state is currently conveyed by background colour alone.

- [ ] **Step 5: Verify**

`pnpm check` exits 0, `pnpm test` passes, `pnpm build` succeeds.

Then confirm the deletions left nothing dangling:

```bash
grep -rn "category-badge\|category-stat-card\|progress-bar\|stats-cards" src || echo clean
```

**Manual check, and be honest about it:** tab into the mosaic and confirm a tile takes focus, shows its tooltip, and announces a sensible label. If you cannot run a browser, say so plainly rather than claiming it.

- [ ] **Step 6: Commit**

```bash
git add -A src
git commit -m "feat(a11y): keyboard path to mosaic tooltips, aria-current on nav

Also deletes four components that no longer have any consumer; they were
already unreachable before the mosaic redesign branch."
```

---

## Task 2: Migrate `/habits`

**Files:**
- Modify: `src/app/habits/page.tsx` (395 lines, 48 old-token references), `src/_components/ui/habits-list.tsx` (12 references)

- [ ] **Step 1: Read both files fully before editing**

This is the app's second main surface and it has real behaviour: a create form with validation, category selection, and the habit list with its actions. **Read it before you change it.** Preserve every behaviour.

- [ ] **Step 2: Apply the token mapping and the type scale**

Per the Global Constraints table. Additionally:
- Wrap card-like containers in `<Card>` rather than hand-rolled bordered divs.
- The category picker should use `Pill` where it fits the existing markup.
- Headings adopt `text-title`; the page heading adopts `text-display`.
- Remove `dark:` variants.

- [ ] **Step 3: Match `/home`'s page shell**

`/habits` should sit in the same frame as `/home`: `bg-[var(--color-canvas)]`, the sidebar, and content offset `md:ml-60` (**not** `md:ml-64` — the sidebar is `w-60`, and that 16px mismatch was a real bug fixed on `/home`). Use the same `max-w-4xl` content column and padding as `src/app/home/page.tsx`. Read that file for the pattern.

- [ ] **Step 4: Verify**

`pnpm check`, `pnpm test`, `pnpm build` all pass.

```bash
grep -nE "color-paper|ink-dark|color-ember|font-serif|italic|fontOpticalSizing" \
  src/app/habits/page.tsx src/_components/ui/habits-list.tsx || echo clean
```

Report explicitly: does creating a habit still work, does validation still fire, does the list still render and act? If you cannot verify in a browser, say so — do not claim it.

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "feat(habits): migrate to the mosaic design system"
```

---

## Task 3: Migrate `/signin` and `/signup`

**Files:**
- Modify: `src/app/signin/page.tsx` (174 lines, 28 references), `src/app/signup/page.tsx` (217 lines, 25 references)

These two are a pair — same shell, same form patterns — so they migrate together and should end up visually consistent with each other.

- [ ] **Step 1: Read both files fully**

**Authentication is the highest-consequence surface in the app.** A broken form here locks every user out. This is a re-skin: do not touch `signIn()`/`signUp()` calls, validation logic, error handling, redirects, or the OAuth flow. If a styling change seems to require touching auth logic, stop and report.

- [ ] **Step 2: Apply the token mapping and type scale**

Per the Global Constraints. Additionally:
- The centred auth card becomes a `<Card>`.
- Inputs get `rounded-[var(--radius-control)]`, `border-[var(--color-hairline)]`, and a visible focus ring — check what the existing inputs do for focus and keep or improve it, never remove it.
- The primary button uses `--color-mind` (matching `/home`'s "Create your first habit").
- Error text uses `--color-body-ink`, which is the text-safe variant.
- Remove `dark:` variants.

- [ ] **Step 3: Verify**

`pnpm check`, `pnpm test`, `pnpm build` all pass.

```bash
grep -nE "color-paper|ink-dark|color-ember|font-serif|italic|fontOpticalSizing" \
  src/app/signin/page.tsx src/app/signup/page.tsx || echo clean
```

Confirm by reading the diff that no auth call, validation branch, redirect or error path changed. State that explicitly in your report.

- [ ] **Step 4: Commit**

```bash
git add -A src
git commit -m "feat(auth): migrate signin and signup to the mosaic design system"
```

---

## Task 4: Migrate the landing page

**Files:**
- Modify: `src/app/page.tsx` (360 lines, 63 old-token references)

- [ ] **Step 1: Understand what this page is for before restyling it**

The landing page is a **different design problem** from the app: it exists to persuade someone who has never used Northstar, not to serve someone using it daily. Its job is the pitch — "a habit tracker that lights up squares like the greens in your GitHub profile."

So apply the system's *vocabulary* — colours, type scale, radii, `Card` where it fits — without flattening it into a dashboard. Marketing pages legitimately run larger type, more generous spacing, and more dramatic composition than app surfaces. `text-display` is the app's largest step; a hero headline may exceed it, and that is fine — say so in your report rather than shrinking the hero to fit a token.

- [ ] **Step 2: Apply the migration**

Per the Global Constraints table. Note `src/_components/landing/unified-demo.tsx` and `landing-footer.tsx` contain **no** old-token references (the demo carries its own local colour map) — leave both files alone.

Preserve the page's structure, copy, and calls-to-action exactly. Nothing here is a content change.

- [ ] **Step 3: Verify**

`pnpm check`, `pnpm test`, `pnpm build` all pass.

```bash
grep -nE "color-paper|ink-dark|color-ember|font-serif|italic|fontOpticalSizing" src/app/page.tsx || echo clean
```

- [ ] **Step 4: Commit**

```bash
git add -A src
git commit -m "feat(landing): migrate to the mosaic design system"
```

---

## Task 5: Delete the compatibility layer

**Files:**
- Modify: `src/styles/globals.css`, `src/app/layout.tsx`, `src/lib/constants.ts`

This task is the proof the migration is complete: the `DEPRECATED` block existed *only* for the four surfaces now migrated.

- [ ] **Step 1: Prove nothing depends on it**

```bash
grep -rnE "color-paper|ink-dark|color-ember|hairline-dark|font-serif|italic|fontOpticalSizing" src || echo clean
```

**If this returns anything at all, stop.** Report what it found and do not proceed — a surviving reference means an earlier task missed something, and deleting the tokens would break that surface silently at runtime with no compile error.

- [ ] **Step 2: Delete the `DEPRECATED` block**

Remove everything between the `DEPRECATED` opening comment and `/* END DEPRECATED */` in `src/styles/globals.css`, including the comment markers and `--font-serif`, plus the legacy `--radius-sm` / `--radius` / `--radius-lg` tokens retained with them.

**Careful:** confirm no *migrated* file relies on Tailwind's bare `rounded` / `rounded-lg` utilities, which those legacy radius tokens were backing. If any do, convert them to `--radius-card`/`--radius-control` first.

- [ ] **Step 3: Remove Fraunces**

In `src/app/layout.tsx`, delete the `Fraunces` import, its constant, and `${fraunces.variable}` from the `<html>` className. One font family remains: Plus Jakarta Sans.

- [ ] **Step 4: Check the last constants alias**

`CATEGORY_HEX` in `src/lib/constants.ts` is marked `@deprecated` and aliases `CATEGORY_HEX_LIGHT`. Check whether anything still imports it. If nothing does, delete it and the alias comment. If something does, leave it and report where.

- [ ] **Step 5: Verify**

`pnpm check`, `pnpm test`, `pnpm build` all pass, and the Step 1 grep is still clean.

**Then check the network tab or build output:** confirm Fraunces is no longer fetched. A removed import that still ships is a sign something else still references the variable.

- [ ] **Step 6: Commit**

```bash
git add -A src
git commit -m "chore(design): delete the paper compatibility layer

The DEPRECATED token block and Fraunces existed only for the landing page,
/habits, /signin and /signup. All four now use the mosaic design system."
```

---

## Deferred — still needs the repo owner

Not clearable without an authenticated session, carried over from the previous plan:

1. **Manual browser verification of the checkbox squish** — that it animates, the console is free of framer-motion's keyframes warning, and the progress bar and strikethrough both animate on a live click.
2. **Year-view legibility at real density** — whether three-way tile splits read at 11px with a full year of real data. The agreed fallback, decided but not built, is that the year view collapses to a dominant category tone while month and week keep true splits.
