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

---

## Task 6: Make perfect days legible in the year view

**Added during execution. A live browser check with real data confirmed the risk accepted at
spec time (design spec §3.3): at 11px, two-way tile splits stay legible but three-way splits
turn to mud — the middle band compresses to a sliver. Approved by the repo owner as a targeted
fix rather than the blanket fallback.**

**Files:**
- Modify: `src/lib/mosaic.ts`, `src/lib/mosaic.test.ts`, `src/_components/ui/mosaic/mosaic-year.tsx`, `src/styles/globals.css`, `scripts/check-palette.ts`

**Why this shape.** The blanket fallback in the spec collapsed *every* multi-category day to a
dominant tone. The browser check showed that overshoots: two-way splits read fine. Only the
three-way case needs help. And a perfect day means all three categories were kept — so
rendering it as a single tone loses **no** information, unlike collapsing a two-way tile.
Perfect days also already carry a ring, so they remain the most identifiable tile on the grid.

- [ ] **Step 1: Add a `--color-perfect` token**

In the `@theme` block of `globals.css` (not the DEPRECATED block), add a light value, and a
dark counterpart in the `.dark` block. It must be visually distinct from all three category
colours and from the empty tile — it is a fourth meaning, not a blend of the other three.
Avoid literally averaging mind/body/soul: that produces exactly the mud this whole redesign
removed.

- [ ] **Step 2: Extend the palette gate to cover it**

In `scripts/check-palette.ts`, add `perfect` to each theme and assert the same rules the
category colours already satisfy: pairwise CIE76 ΔE ≥ 40 against `mind`, `body` and `soul`,
and ΔL* ≥ 18 against `tileEmpty`. If your chosen colour fails, change the colour — do not
weaken the thresholds. Run `pnpm check:palette` and paste the output.

- [ ] **Step 3: Add a compact rendering to the pure module**

In `src/lib/mosaic.ts`, add a variant that the year view uses:

```ts
/**
 * Background for a tile too small to render three bands legibly. Perfect days
 * collapse to a single tone (no information is lost — all three were kept);
 * every other state renders exactly as `tileBackground`.
 */
export function tileBackgroundCompact(c: DayCategories): string
```

A perfect day returns `var(--color-perfect)`. Every other state — empty, one category, any
two-category pair — must return **exactly** what `tileBackground` returns. Delegate rather
than duplicating the gradient construction.

- [ ] **Step 4: Test it**

Add cases to `src/lib/mosaic.test.ts` asserting: the perfect-day case returns the new token;
and all seven non-perfect states return output identical to `tileBackground` for the same
input. Assert that equivalence by comparing the two functions' outputs directly, so the two
can never drift apart.

- [ ] **Step 5: Use it in the year view only**

`mosaic-year.tsx` uses the compact variant. `mosaic-month.tsx` and `mosaic-week.tsx` keep
`tileBackground` and its true three-band splits — at 34px and 60px they are legible, and that
is where a user goes to interrogate a specific day.

`MosaicTile` will need to accept which background to use. Prefer passing the computed
background string, or a small explicit flag, over the tile deciding for itself — the tile
should stay dumb.

The perfect-day ring must still render in the year view. Confirm it does.

- [ ] **Step 6: Update the legend**

`mosaic-legend.tsx` shows a three-band swatch for "Perfect day". In the year view that no
longer matches what is drawn. Make the legend honest — the simplest correct option is to show
the `--color-perfect` swatch with its ring, since the legend sits directly beneath the graph.

- [ ] **Step 7: Verify**

`pnpm check` exits 0 (including the extended palette gate), `pnpm test` passes with the new
cases, `pnpm build` succeeds.

**If a browser session is available**, look at the year view again and confirm perfect days now
read clearly and two-way splits are unchanged. If not, say so plainly rather than claiming it.

- [ ] **Step 8: Commit**

```bash
git add -A src scripts docs
git commit -m "feat(mosaic): render perfect days as a solid tone in the year view

At 11px a three-way split compresses its middle band to a sliver. A perfect
day keeps all three categories, so a single tone loses no information, and the
ring still marks it. Month and week keep true splits."
```

---

## Lessons from execution — read this before continuing

Written down because they were learned expensively and would otherwise live only in a
conversation that ends.

**1. Diff review cannot catch runtime animation bugs. Drive a browser.**
Three defects on this work were found *only* because an agent opened a real browser, and every
one had passed multiple careful diff reviews:
- `scale: [1, 0.88, 1]` is three keyframes, and framer-motion supports only two with a `spring`
  transition. It **throws and aborts the whole animation batch**, silently freezing unrelated
  animations elsewhere on the page. This shipped **twice** — once in `Checkbox`, once in the
  mosaic tile pulse. If you write a keyframe array, its transition must be a `tween`.
- The mosaic tooltip used `position: fixed` inside a `.animate-rise-in` ancestor. A transformed
  ancestor becomes the containing block for fixed positioning, and `animation-fill-mode: both`
  makes the final `translateY(0)` persist forever — so the tooltip was permanently
  mispositioned, for mouse users, from the day it shipped.

**2. The type scale absorbs accidental duplication, not deliberate local sizing.**
A caption was converted to `text-eyebrow` when it had been sized at 11px specifically to sit
level with the `Pill`s beside it. It had to be reverted. If a site's size differs from the
token and the difference looks intentional given its neighbours, leave it.

**3. Verification gates are worthless until you prove they run.**
`tsconfig.json` set an `ignoreDeprecations` value invalid for the installed TypeScript, so `tsc`
aborted on the config and **had never typechecked this repo**. Every task's "verified" gate was
theatre until that was fixed. Check that a gate can fail before trusting that it passes.

**4. Lint rules must not drive runtime behaviour.**
Chasing `prefer-nullish-coalescing` converted `||` to `??` at three sites, and since `??` does
not catch empty strings, a user with a blank name would have rendered blank labels. Satisfying a
linter is never worth a behaviour change.

**5. Most defects found were in the plan, not the implementations.**
Dropped radius tokens, an unguarded date range, a dependency array that stranded a timer, a type
scale specified but never built, a legend fix that ignored two of three views. Write briefs
knowing this: state the *intent* behind an instruction so an implementer can notice when the
literal instruction contradicts it. Several did, and were right to push back.

**6. Ask implementers for evidence, not agreement.**
When a review finding looked wrong, sending it back as "verify this empirically, refute it if I'm
wrong" produced a correct refutation with a browser trace — and no code was changed to fix a
non-bug. A finding is a hypothesis until someone checks it.

**7. Never claim verification you did not perform.**
Agents repeatedly hit signed-out sessions and correctly declined to submit sign-in forms with
credentials that weren't theirs. Those honest "couldn't reach it" reports were far more useful
than a confident guess would have been.

---

## Deferred follow-ups (branch merged 2026-08-13)

Reviewed, judged non-blocking, and deliberately not fixed. Recorded here because the execution
ledger they lived in is gone.

**Accessibility**
1. **Focus indicators are border-colour-only** across `/signin`, `/signup` and `/habits`
   (`focus:outline-none` plus a border swap). Computed to *pass* SC 1.4.11 — light 4.86:1, dark
   6.32:1, with a real luminance jump — so not a violation, but materially weaker than a ring on
   the forms standing between a user and their account. **Fix all three together**; a ring on auth
   alone would create a fresh inconsistency.
2. **The mosaic year grid has ~225 focusable tiles**, i.e. ~225 tab stops. Focusability was the
   sanctioned partial fix; roving tabindex with arrow-key navigation is the proper answer.
3. **The habits modal has no `role="dialog"`, `aria-modal`, focus trap, or Escape handler.**
   Pre-existing. The migration rewrote its styling and would have been a natural moment.

**Design system**
4. **No shared `Banner` primitive.** The error banner has two different treatments across
   `/habits` (`/10`, `px-4 py-3`, 13px) and the auth pages (`/8`, `px-3 py-2`, 12px). A primitive
   alongside `Card`/`Pill` would close it. This is a symptom of per-task scoping — see below.
5. **`--color-soul-ink` is defined, gated, and never consumed.** Set completeness, not a defect.
6. **`body`/`soul` are ungated as button backgrounds** in `scripts/check-palette.ts`. Deliberate:
   nothing uses them that way since the habits button moved to `--color-ink`, and no single
   foreground clears 4.5:1 against all of mind/body/soul/ink in both themes. The gate's comment
   documents this. **Anyone adding a category-coloured button must pick a foreground and gate it.**
7. **The landing CTA's hover state is 4.40:1** in light mode (`src/app/page.tsx`) — marginally
   under 4.5. Dark is 6.90:1.
8. **The three date-grid builders** in `mosaic-year/month/week.tsx` remain inline and untested —
   the highest-risk untested logic in the app (year boundaries, padding, `date > today`
   comparisons). Extracting them to `~/lib/mosaic` with an injectable `now` would make them
   testable cheaply.

**Landing page** — items are in `docs/superpowers/specs/2026-08-13-landing-page-uplift-brief.md` §8,
including a verified defect: `unified-demo.tsx`'s category gradients are built by string
interpolation, so Tailwind never generates them and they have **never rendered**.

**Process note from the final review**, worth acting on next time: per-task reviews caught
everything *inside* a task and missed everything *between* tasks — two primary buttons disagreeing
on their foreground token, a label builder triplicated across three files, the banner divergence
above. **Add an explicit "reconcile shared patterns" task after any set of parallel migration
tasks.** It is far cheaper than finding those seams at the merge gate.
