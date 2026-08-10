# Northstar — Mosaic Redesign

**Date:** 2026-08-10
**Scope:** Design system + `/home` (including the sidebar, which appears on `/home`).
**Out of scope:** `/habits`, landing page, sign-in, sign-up. They inherit the system in a later pass.

---

## 1. Purpose

Northstar is "GitHub, but for your daily life." The contributions graph is the product's identity, not a widget on a dashboard. This redesign replaces the warm-paper editorial direction with a modern, soft, color-coded system in the spirit of Tiimo, and promotes the graph to hero.

The central idea: **a day in the graph is divided by which parts of your life you showed up for** — mind, body, soul — so the year reads as a three-color mosaic instead of one green ramp. That makes the graph diagnostic rather than decorative. You can see at a glance that you have been all body and no soul since June.

### Why the current graph fails

`activity-graph.tsx` already attempts category blending, but it averages RGB channels (`mix()`, lines 24–30). The three existing category colors — slate-blue `#5b7a99`, terracotta `#b5553a`, sage `#6f8a5e` — sit at nearly identical lightness and saturation, so averaging any two produces mud, and the all-three case is discarded entirely in favour of a single ember tone. The richest day in the dataset is the one that loses the most information.

The fix is twofold: separate the palette on hue *and* lightness, and divide each tile **spatially** so the colors stay pure instead of destroying each other.

---

## 2. Design language

Light-first, with dark at parity — dark values are independently tuned, never inverted.

### 2.1 Color tokens

Light:

| Token | Value |
|---|---|
| `canvas` | `#F4F3F8` |
| `surface` | `#FFFFFF` |
| `sunken` | `#EDEBF4` |
| `hairline` | `#E7E5EF` |
| `ink` | `#191822` |
| `ink-muted` | `#6E6C82` |
| `ink-faint` | `#A9A7B8` |
| `mind` | `#6C5CE7` |
| `body` | `#F2542D` |
| `soul` | `#0FA47F` |

Dark:

| Token | Value |
|---|---|
| `canvas` | `#131219` |
| `surface` | `#1C1B25` |
| `sunken` | `#26242F` |
| `hairline` | `#2A2836` |
| `ink` | `#EDECF5` |
| `ink-muted` | `#9694AC` |
| `ink-faint` | `#6E6C82` |
| `mind` | `#9C8FFF` |
| `body` | `#FF7D5C` |
| `soul` | `#35C9A3` |

**Category color rule (binding).** Within a theme, any two category colors must differ by **≥10 in CIE L\***, and each must reach **≥3:1 contrast against that theme's `surface`**. The hex values above are candidates; the verification script in §7 is authoritative. If a candidate fails, adjust lightness while preserving hue and re-run.

All tokens are declared in `src/styles/globals.css` under `@theme`, replacing the entire paper palette. `CATEGORY_HEX` in `src/lib/constants.ts` gains per-theme values so the same colors are reachable from inline styles.

### 2.2 Typography

One family: **Plus Jakarta Sans** (`next/font/google`), variable `--font-sans`. Fraunces and the `--font-serif` layer are removed from `layout.tsx` and `globals.css`.

Six-step scale, replacing the ~14 ad-hoc hard-coded pixel sizes currently scattered across the pages:

| Step | Size / line-height / weight / tracking |
|---|---|
| `display` | 34px / 1.05 / 800 / −0.03em (28px below `sm`) |
| `title` | 22px / 1.2 / 700 / −0.02em |
| `stat` | 30px / 1.0 / 800 / −0.04em, tabular figures |
| `body` | 14px / 1.5 / 500 |
| `label` | 12px / 1.4 / 600 |
| `eyebrow` | 10px / 1.0 / 700 / +0.1em, uppercase |

All numeric output uses `font-variant-numeric: tabular-nums`.

### 2.3 Surfaces, radii, spacing

- Radii: tile 2px (year) / 8px (month) / 12px (week); control 12px; card 16px; pill 999px.
- Elevation, light — card: `0 1px 2px rgba(25,24,34,.04), 0 6px 18px -6px rgba(25,24,34,.10)`; hover lift: `0 2px 4px rgba(25,24,34,.05), 0 12px 28px -8px rgba(25,24,34,.16)`.
- Elevation, dark — shadows read poorly on near-black, so depth comes from `hairline` borders plus `0 6px 18px -6px rgba(0,0,0,.5)`.
- Spacing on a 4px base. Card padding 16–18px; gap between cards 10–12px; page padding 20px / 24px `sm` / 32px `lg`.

### 2.4 Motion tokens

- Durations: fast 140ms, base 220ms, slow 420ms.
- Easing: `cubic-bezier(.22, 1, .36, 1)`.
- Spring (framer-motion, already a dependency at v12): `{ type: "spring", stiffness: 420, damping: 26 }`.

---

## 3. The mosaic

### 3.1 Data model

`useGraphData` (`src/hooks/use-graph-data.ts:35`) already reduces each date to three booleans — any completion in a category sets it `true`. A day therefore has exactly **eight states**.

This is a deliberate choice: the mosaic encodes **breadth, not effort**. One mind habit and five mind habits render identically, because the question the graph answers is "did you show up for this part of your life today." No server, schema, router, or migration changes are required — this is a pure presentation change.

### 3.2 Tile rendering

A tile is a CSS `linear-gradient` at **135°** with hard stops, in the fixed order **mind → body → soul**. Bands reference CSS custom properties (`var(--color-mind)` etc.) rather than literal hex, so a single output string serves both themes and the theme class swaps the underlying values:

- 0 categories → solid `sunken`.
- 1 category → solid category color.
- 2 categories → two equal bands (0–50%, 50–100%).
- 3 categories → three equal bands (0–33.33%, 33.33–66.66%, 66.66–100%).

The axis and order are **fixed and identical in every view**. Position is the primary encoder of identity; color reinforces it. This is what keeps tiles parseable for colorblind users and at small sizes.

**Perfect day** (all three) keeps its three true colors and additionally earns a ring: `0 0 0 1.5px <canvas>, 0 0 0 2.5px <ink at 28% (light) / 35% (dark)>`. It must never be recolored to a single tone — that is the current bug.

### 3.3 Views

| View | Tile | Notes |
|---|---|---|
| Year | ~11px, 3px gap, radius 2 | Horizontal scroll below `md`; month labels along the top |
| Month | 34px, 7px gap, radius 8 | Day numbers inside the tile |
| Week | 60px, radius 12 | Weekday label beneath; category bands explicitly labelled |

**Known risk, accepted:** three-way splits at 11px are dense. This was reviewed at real scale during design and approved. If real user data proves it illegible in practice, the fallback — already decided — is that the year view collapses to the dominant category tone while month and week retain true splits. This fallback is *not* built now.

Legend: three category pills plus a perfect-day swatch. Tooltip on hover/focus shows the date and which of the three categories were kept.

### 3.4 Live connection to check-in

The mosaic's final tile is today. Completing a habit updates that tile immediately from the shared query cache and pulses it once. This links the action to the artifact and is the single most important interaction in the app.

---

## 4. `/home` composition

Order: **header** (greeting, date, streak) → **today's check-in** → **the mosaic** → **stats row** (week %, total, best) → **category breakdown** (mind/body/soul counts) → **mood tracker**.

Check-in leads because it is the daily job. The mosaic follows as the reward and is the visual hero by size and weight.

Removed entirely: the five roman-numeral sections, the marginalia rail, epigraphs, folio numbers, star dividers, the compass ornament, and the "finis" footer.

**Sidebar.** Brought into the system: same canvas, wordmark at top, two nav items with the active state as a filled soft pill (replacing the 2px edge bar), user button pinned bottom. The `Navigate` eyebrow is dropped. **Bug fix:** the aside is `w-60` (240px) while content offsets `md:ml-64` (256px) — a permanent 16px misalignment. Both become 240px.

---

## 5. Component architecture

The governing move: **tile logic leaves React.**

- `src/lib/mosaic.ts` — pure. `tileBackground({ mind, body, soul })` returns a CSS background string built from `var(--color-*)` references, so it is theme-agnostic; `isPerfectDay(day)` returns a boolean. No React, no Tailwind. Single source of truth for all three views. Replaces the `RGB` map, `mix()`, `getColor()` and `getCategoryColor()` currently inside `activity-graph.tsx`.
- `src/_components/ui/mosaic/` — `mosaic-tile.tsx` (one day, presentational), `mosaic-year.tsx`, `mosaic-month.tsx`, `mosaic-week.tsx`, `mosaic-legend.tsx`, `mosaic.tsx` (shell: view switch, tooltip). Replaces the four `activity-graph*.tsx` files, which are deleted.
- `src/_components/ui/primitives/` — `card.tsx`, `stat.tsx`, `pill.tsx`, `checkbox.tsx`. Shared kit so `/habits` inherits the system in the next pass rather than drifting again.
- `src/app/home/page.tsx` — reduced from 559 lines to roughly 120. The eight inlined editorial components (`JournalDate`, `StarDivider`, `FolioNumber`, `Epigraph`, `CompassOrnament`, `SectionHeader`, `Reckoning`, `ThreeGardens`) are **deleted, not ported**.
- `src/lib/constants.ts` — `CATEGORY_COLORS`, the legacy class-string blob already marked legacy in its own comment, is removed. `CATEGORY_HEX` gains per-theme values.
- `src/_components/ui/index.ts` — updated to match.

---

## 6. Interaction and states

### 6.1 Check-off

- Checkbox scales `1 → 0.88 → 1` on the spring token; the checkmark path draws over 180ms rather than appearing.
- The habit name's strikethrough animates its width over 220ms.
- Today's mosaic tile pulses once (`scale 1 → 1.18 → 1`) and gains its new band.
- The progress indicator becomes a 6px rounded bar (from a 2px hairline) with spring-animated width.
- On the transition to all-complete: confetti fires and the tile's perfect-day ring scales in.

**Trigger bug fix.** `checkin-list.tsx:27–37` sets `shouldCelebrate` true and clears it on a 100ms `setTimeout`, and writes `prevCompletedCount` inside the same effect that reads it — a fragile trigger that can double-fire or miss. It is replaced with an explicit incomplete → complete transition check.

### 6.2 Page load

One orchestrated entrance: cards rise 12px and fade in, staggered 60ms, capped at six items.

### 6.3 Reduced motion

Under `prefers-reduced-motion: reduce`, every animation above collapses to opacity-only. This is binding, not optional — the design references an ADHD tool and motion sensitivity overlaps that audience heavily.

### 6.4 Loading, empty, error

- **Loading:** skeleton cards in the real layout. The "opening the journal…" italic line is removed.
- **Empty (no habits):** a first-run card explaining the three categories with a primary action to `/habits`.
- **Empty (habits but no completions):** the mosaic renders its full empty grid with a short caption, not a hidden or collapsed state.
- **Error:** inline banner at the top of the content column, restyled to the new system.

---

## 7. Verification

The repo has no test runner. Vitest is added.

1. **Unit — `src/lib/mosaic.test.ts`.** All eight states produce the expected background string (one expected value per state, since the output is theme-agnostic). Perfect-day detection is correct for exactly the all-three case. This is the piece most worth locking down, and it is cheap because the module is pure.
2. **Palette script — `scripts/check-contrast.ts`.** Asserts ≥10 CIE L\* separation between the three category colors and ≥3:1 against `surface`, per theme. Wired into `pnpm check`. Failure is a build failure.
3. **Static checks.** `pnpm check` (lint + typecheck) and `pnpm build` pass clean.
4. **Manual.** Run the app; screenshot `/home` in light and dark at 375px, 768px, and 1440px; confirm the year row reads correctly at real density with seeded data. A unit test cannot answer the legibility question — a person has to look.

---

## 8. Success criteria

- A day's tile shows which categories were kept, in pure colors, in every view.
- A perfect day is visibly distinct without losing its category information.
- Checking off a habit visibly updates today's tile in the mosaic.
- `/home` is under ~150 lines and contains no layout logic that belongs in a component.
- No serif font, no paper token, and no `CATEGORY_COLORS` reference remains in the codebase.
- Light and dark are both first-class; neither is a filter over the other.
- Every animation has a reduced-motion path.
