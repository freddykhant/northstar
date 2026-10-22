# Northstar Mosaic Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Northstar's warm-paper editorial design with a light-first, Tiimo-inspired system in which the contributions graph becomes a three-colour mosaic showing which parts of life (mind/body/soul) you showed up for each day.

**Architecture:** All tile colour logic moves out of React into a pure module (`src/lib/mosaic.ts`) that emits CSS `linear-gradient` strings built from CSS custom properties, so one output serves both themes. Four `activity-graph*` files are replaced by a focused `mosaic/` directory. Design tokens live in Tailwind v4's `@theme` block in `globals.css`. A small shared primitives kit stops `/home` from re-inlining layout components.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, tRPC v11, TanStack Query v5, framer-motion v12 (already installed), next-themes, Vitest (added by this plan), pnpm.

## Global Constraints

- **Scope is the design system plus `/home` only.** `/habits`, the landing page, `/signin` and `/signup` are explicitly out of scope and must keep rendering exactly as they do today.
- **The paper tokens cannot be deleted.** They are consumed by out-of-scope surfaces: landing (72 references), `/habits` (67), `/signin` (38), `/signup` (32), plus `habits-list`, `stats-cards`, `category-stat-card`, `category-badge` and `progress-bar`. Deleting them would render those pages with undefined CSS variables. They are retained in a clearly marked `DEPRECATED` block and removed in the follow-up pass. This deviates from spec §8 ("no paper token remains") and is deliberate.
- **Fraunces and `--font-serif` are likewise retained** for the same reason — out-of-scope pages use `font-serif`. No in-scope file may use `font-serif` or any paper token.
- **Category colours (light):** mind `#6C5CE7`, body `#F2542D`, soul `#0FA47F`. **(dark):** mind `#9C8FFF`, body `#FF7D5C`, soul `#35C9A3`. These are approved; do not change them. If a verification script fails, report it rather than editing the colours.
- **Palette rules (binding, verified by `scripts/check-palette.ts`):** pairwise CIE76 ΔE ≥ 40 between the three category colours within a theme; ΔL\* ≥ 18 between every category colour and that theme's empty-tile colour; category-as-text uses the separate `*-ink` tokens at ≥ 4.5:1 against surface.
- **Tile geometry is fixed everywhere:** `linear-gradient` at **135°**, hard stops, always in the order **mind → body → soul**. Position encodes identity; colour reinforces it.
- **A perfect day is never recoloured to a single tone.** It keeps all three bands and gains a ring.
- **Every animation must have a `prefers-reduced-motion: reduce` path** that collapses to opacity-only.
- **Type:** one family, Plus Jakarta Sans, via `next/font/google`. All numeric output uses `tabular-nums`.
- **Commit after every task.** Run `pnpm check` before each commit.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config with the `~` path alias |
| `src/lib/mosaic.ts` | Pure tile logic — the single source of truth for tile colour |
| `src/lib/mosaic.test.ts` | Unit tests for all eight states |
| `scripts/check-palette.ts` | Enforces the palette rules; wired into `pnpm check` |
| `src/_components/ui/primitives/card.tsx` | Surface container |
| `src/_components/ui/primitives/stat.tsx` | Big tabular number + label |
| `src/_components/ui/primitives/pill.tsx` | Category chip |
| `src/_components/ui/primitives/checkbox.tsx` | Animated check control |
| `src/_components/ui/primitives/index.ts` | Primitives barrel |
| `src/_components/ui/mosaic/mosaic-tile.tsx` | One day, presentational |
| `src/_components/ui/mosaic/mosaic-year.tsx` | Year grid |
| `src/_components/ui/mosaic/mosaic-month.tsx` | Month grid |
| `src/_components/ui/mosaic/mosaic-week.tsx` | Week strip |
| `src/_components/ui/mosaic/mosaic-legend.tsx` | Legend |
| `src/_components/ui/mosaic/mosaic.tsx` | Shell: view switch + tooltip |
| `src/_components/ui/mosaic/index.ts` | Mosaic barrel |
| `src/_components/ui/home/home-header.tsx` | Greeting, date, streak |
| `src/_components/ui/home/home-skeleton.tsx` | Loading state |
| `src/_components/ui/home/home-empty.tsx` | First-run state |

**Modified:** `src/styles/globals.css`, `src/app/layout.tsx`, `src/lib/constants.ts`, `src/lib/types.ts`, `src/_components/ui/checkin-list.tsx`, `src/_components/ui/confetti.tsx`, `src/_components/ui/sidebar.tsx`, `src/_components/ui/user-button.tsx`, `src/_components/ui/mood-tracker.tsx`, `src/app/home/page.tsx`, `src/_components/ui/index.ts`, `package.json`.

**Deleted:** `src/_components/ui/activity-graph.tsx`, `activity-graph-year-view.tsx`, `activity-graph-month-view.tsx`, `activity-graph-week-view.tsx`.

---

## Task 1: Pure mosaic logic + test runner

**Files:**
- Create: `vitest.config.ts`, `src/lib/mosaic.ts`, `src/lib/mosaic.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CategoryId` from `~/lib/types`.
- Produces: `DayCategories` (declared in `src/lib/types.ts`, re-exported from `mosaic.ts`); `tileBackground(c: DayCategories): string`; `isPerfectDay(c: DayCategories): boolean`; `activeCategories(c: DayCategories): CategoryId[]`.

`DayCategories` lives in `types.ts` rather than `mosaic.ts` so that `types.ts` never has to import from `mosaic.ts` — `mosaic.ts` already imports `CategoryId` from `types.ts`, and the reverse edge would create a circular import.

- [ ] **Step 1: Install Vitest**

```bash
pnpm add -D vitest@^3
```

- [ ] **Step 2: Create `vitest.config.ts`**

The project is ESM (`"type": "module"`), so `__dirname` does not exist — derive it from `import.meta.url`.

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "~": path.resolve(dirname, "./src") },
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Declare `DayCategories` in `src/lib/types.ts`**

`DayData.categories` is already this exact shape. Naming it means the mosaic and the graph data can never drift apart. Replace the existing `DayData` block with:

```ts
export interface DayCategories {
  mind: boolean;
  body: boolean;
  soul: boolean;
}

export interface DayData {
  date: string;
  categories: DayCategories;
}
```

- [ ] **Step 5: Write the failing test**

Create `src/lib/mosaic.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  activeCategories,
  isPerfectDay,
  tileBackground,
  type DayCategories,
} from "./mosaic";

const day = (
  mind: boolean,
  body: boolean,
  soul: boolean,
): DayCategories => ({ mind, body, soul });

describe("tileBackground", () => {
  it("renders an empty day as the sunken token", () => {
    expect(tileBackground(day(false, false, false))).toBe(
      "var(--color-tile-empty)",
    );
  });

  it("renders a single category as a solid colour", () => {
    expect(tileBackground(day(true, false, false))).toBe("var(--color-mind)");
    expect(tileBackground(day(false, true, false))).toBe("var(--color-body)");
    expect(tileBackground(day(false, false, true))).toBe("var(--color-soul)");
  });

  it("splits two categories into equal halves at 135 degrees", () => {
    expect(tileBackground(day(true, true, false))).toBe(
      "linear-gradient(135deg, var(--color-mind) 0% 50%, var(--color-body) 50% 100%)",
    );
    expect(tileBackground(day(true, false, true))).toBe(
      "linear-gradient(135deg, var(--color-mind) 0% 50%, var(--color-soul) 50% 100%)",
    );
    expect(tileBackground(day(false, true, true))).toBe(
      "linear-gradient(135deg, var(--color-body) 0% 50%, var(--color-soul) 50% 100%)",
    );
  });

  it("splits three categories into equal thirds in mind/body/soul order", () => {
    expect(tileBackground(day(true, true, true))).toBe(
      "linear-gradient(135deg, var(--color-mind) 0% 33.333%, var(--color-body) 33.333% 66.667%, var(--color-soul) 66.667% 100%)",
    );
  });
});

describe("isPerfectDay", () => {
  it("is true only when all three categories are kept", () => {
    expect(isPerfectDay(day(true, true, true))).toBe(true);
    expect(isPerfectDay(day(true, true, false))).toBe(false);
    expect(isPerfectDay(day(false, false, false))).toBe(false);
  });
});

describe("activeCategories", () => {
  it("returns kept categories in mind/body/soul order", () => {
    expect(activeCategories(day(false, true, true))).toEqual(["body", "soul"]);
    expect(activeCategories(day(true, false, false))).toEqual(["mind"]);
    expect(activeCategories(day(false, false, false))).toEqual([]);
  });
});
```

- [ ] **Step 6: Run the test and verify it fails**

Run: `pnpm test`
Expected: FAIL — `Failed to resolve import "./mosaic"`.

- [ ] **Step 7: Write the implementation**

Create `src/lib/mosaic.ts`:

```ts
// Pure tile logic for the activity mosaic.
//
// A day is three booleans, so there are exactly eight states. Tiles are split
// spatially rather than by blending colour, because blending destroys the
// information the mosaic exists to show. The 135deg axis and the mind/body/soul
// order are fixed in every view so that POSITION encodes identity and colour
// merely reinforces it — that is what keeps tiles readable at 11px and for
// colourblind users.

import type { CategoryId, DayCategories } from "./types";

export type { DayCategories };

const ORDER: readonly CategoryId[] = ["mind", "body", "soul"] as const;

/** Kept categories, always in mind/body/soul order. */
export function activeCategories(c: DayCategories): CategoryId[] {
  return ORDER.filter((id) => c[id]);
}

/** True only when all three categories were kept. */
export function isPerfectDay(c: DayCategories): boolean {
  return c.mind && c.body && c.soul;
}

/**
 * CSS `background` value for one day. References CSS custom properties rather
 * than literal hex, so a single string serves light and dark.
 */
export function tileBackground(c: DayCategories): string {
  const active = activeCategories(c);

  if (active.length === 0) return "var(--color-tile-empty)";
  if (active.length === 1) return `var(--color-${active[0]})`;

  const step = 100 / active.length;
  const stops = active.map((id, i) => {
    const from = fmt(i * step);
    const to = fmt((i + 1) * step);
    return `var(--color-${id}) ${from}% ${to}%`;
  });

  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

/** Trims trailing zeros so 50.000 renders as 50 and 33.333 stays 33.333. */
function fmt(n: number): string {
  return String(Number(n.toFixed(3)));
}
```

- [ ] **Step 8: Run the test and verify it passes**

Run: `pnpm test`
Expected: PASS — 6 tests.

- [ ] **Step 9: Commit**

```bash
git add vitest.config.ts src/lib/mosaic.ts src/lib/mosaic.test.ts src/lib/types.ts package.json pnpm-lock.yaml
git commit -m "feat(mosaic): add pure tile logic with vitest coverage"
```

---

## Task 2: Design tokens and typeface

**Files:**
- Modify: `src/styles/globals.css`, `src/app/layout.tsx`, `src/lib/constants.ts`

**Interfaces:**
- Produces: CSS custom properties `--color-canvas`, `--color-surface`, `--color-sunken`, `--color-hairline`, `--color-ink`, `--color-ink-muted`, `--color-ink-faint`, `--color-mind`, `--color-body`, `--color-soul`, `--color-mind-ink`, `--color-body-ink`, `--color-soul-ink`, `--color-tile-empty`, `--shadow-card`, `--shadow-lift`, `--ease-out`, plus `CATEGORY_HEX_LIGHT` / `CATEGORY_HEX_DARK` from `constants.ts`.

- [ ] **Step 1: Replace the `@theme` block in `src/styles/globals.css`**

Keep the existing `@import "tailwindcss";` and `@variant dark (&:where(.dark, .dark *));` lines at the top. Replace everything from `@theme {` to the end of the file with:

```css
@theme {
  /* Typography — one family. */
  --font-sans:
    var(--font-sans), ui-sans-serif, -apple-system, BlinkMacSystemFont,
    system-ui, sans-serif;

  /* DEPRECATED — retained only so the out-of-scope surfaces (landing,
     /habits, /signin, /signup) keep rendering. No in-scope file may use
     font-serif or any color-paper/ink-dark/ember token. Removed in the
     follow-up pass that migrates those pages. */
  --font-serif:
    var(--font-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif;
  --color-paper: #f6f3ec;
  --color-paper-raised: #fbf9f3;
  --color-paper-dark: #14110d;
  --color-paper-dark-raised: #1c1814;
  --color-ink-dark: #ece7dd;
  --color-ink-dark-muted: #9a9489;
  --color-ember: #b94a1f;
  --color-ember-soft: #d9683b;
  /* END DEPRECATED */

  /* Surfaces — light */
  --color-canvas: #f4f3f8;
  --color-surface: #ffffff;
  --color-sunken: #edebf4;
  --color-hairline: #e7e5ef;
  --color-ink: #191822;
  --color-ink-muted: #6e6c82;
  --color-ink-faint: #a9a7b8;

  /* Categories — light */
  --color-mind: #6c5ce7;
  --color-body: #f2542d;
  --color-soul: #0fa47f;

  /* Category-as-text — darker variants meeting 4.5:1 on white */
  --color-mind-ink: #5346b8;
  --color-body-ink: #b83c1c;
  --color-soul-ink: #0a7a5e;

  /* The empty tile. Separate token from --color-sunken so the mosaic's
     contrast floor can be tuned without moving every sunken surface. */
  --color-tile-empty: #e7e4f1;

  /* Elevation */
  --shadow-card: 0 1px 2px rgba(25, 24, 34, 0.04),
    0 6px 18px -6px rgba(25, 24, 34, 0.1);
  --shadow-lift: 0 2px 4px rgba(25, 24, 34, 0.05),
    0 12px 28px -8px rgba(25, 24, 34, 0.16);

  /* Radii */
  --radius-tile-year: 2px;
  --radius-tile-month: 8px;
  --radius-tile-week: 12px;
  --radius-control: 12px;
  --radius-card: 16px;

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 140ms;
  --duration-base: 220ms;
  --duration-slow: 420ms;
}

/* Dark — retuned values, never an inversion. */
.dark {
  --color-canvas: #131219;
  --color-surface: #1c1b25;
  --color-sunken: #26242f;
  --color-hairline: #2a2836;
  --color-ink: #edecf5;
  --color-ink-muted: #9694ac;
  --color-ink-faint: #6e6c82;

  --color-mind: #9c8fff;
  --color-body: #ff7d5c;
  --color-soul: #35c9a3;

  --color-mind-ink: #b3a8ff;
  --color-body-ink: #ff9a80;
  --color-soul-ink: #5fd8b8;

  --color-tile-empty: #26242f;

  /* Shadows read poorly on near-black; depth comes from borders. */
  --shadow-card: 0 6px 18px -6px rgba(0, 0, 0, 0.5);
  --shadow-lift: 0 12px 28px -8px rgba(0, 0, 0, 0.6);
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-rise-in {
  animation: rise-in var(--duration-slow) var(--ease-out) both;
}

a,
button,
input,
select,
textarea,
[role="button"] {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-ink);
}

.tabular {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .animate-rise-in {
    animation: none;
    opacity: 1;
    transform: none;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Swap the typeface in `src/app/layout.tsx`**

Replace the `Fraunces, Inter` import and the two font constants with:

```tsx
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// DEPRECATED — retained for out-of-scope surfaces only. See globals.css.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});
```

Then update the `<html>` className from `${inter.variable} ${fraunces.variable}` to `${jakarta.variable} ${fraunces.variable}`.

- [ ] **Step 3: Update `CATEGORY_HEX` in `src/lib/constants.ts`**

Replace the existing `CATEGORY_HEX` block (leave `CATEGORY_COLORS` alone for now — it is removed in Task 14) with:

```ts
// Per-theme category hexes, mirroring the CSS vars in globals.css. Needed only
// where a real hex is required (canvas, image export); prefer var(--color-mind)
// in markup so theme switching is automatic.
export const CATEGORY_HEX_LIGHT: Record<CategoryId, string> = {
  mind: "#6c5ce7",
  body: "#f2542d",
  soul: "#0fa47f",
} as const;

export const CATEGORY_HEX_DARK: Record<CategoryId, string> = {
  mind: "#9c8fff",
  body: "#ff7d5c",
  soul: "#35c9a3",
} as const;

/** @deprecated Use CATEGORY_HEX_LIGHT/DARK or var(--color-<id>). */
export const CATEGORY_HEX = CATEGORY_HEX_LIGHT;
```

- [ ] **Step 4: Verify the build compiles**

Run: `pnpm check`
Expected: PASS. Out-of-scope pages still reference the deprecated tokens, which still exist, so nothing breaks.

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/app/layout.tsx src/lib/constants.ts
git commit -m "feat(design): add mosaic design tokens and Plus Jakarta Sans"
```

---

## Task 3: Palette verification script

**Files:**
- Create: `scripts/check-palette.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: the hex values from Task 2.
- Produces: `pnpm check:palette`, wired into `pnpm check`. Exits non-zero on violation.

- [ ] **Step 1: Write the script**

Create `scripts/check-palette.ts`:

```ts
// Enforces the mosaic palette rules. Lightness alone is the wrong metric for
// "can you tell these apart" — hue does most of the work — so category colours
// are compared by perceptual distance (CIE76 dE) in Lab. Lightness IS the right
// metric against the empty tile, where the question is "does a marked day read
// as darker than an unmarked one".

type RGB = [number, number, number];
type Lab = [number, number, number];

const THEMES = {
  light: {
    mind: "#6c5ce7",
    body: "#f2542d",
    soul: "#0fa47f",
    tileEmpty: "#e7e4f1",
    surface: "#ffffff",
    mindInk: "#5346b8",
    bodyInk: "#b83c1c",
    soulInk: "#0a7a5e",
  },
  dark: {
    mind: "#9c8fff",
    body: "#ff7d5c",
    soul: "#35c9a3",
    tileEmpty: "#26242f",
    surface: "#1c1b25",
    mindInk: "#b3a8ff",
    bodyInk: "#ff9a80",
    soulInk: "#5fd8b8",
  },
} as const;

const MIN_DELTA_E = 40; // between category colours
const MIN_DELTA_L = 18; // between a category colour and the empty tile
const MIN_TEXT_CONTRAST = 4.5; // category-as-text on surface

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance per WCAG. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(linearize) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** sRGB -> CIE Lab (D65). */
function toLab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex).map(linearize) as RGB;
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function lightness(hex: string): number {
  return toLab(hex)[0];
}

const failures: string[] = [];

for (const [themeName, t] of Object.entries(THEMES)) {
  const cats = [
    ["mind", t.mind],
    ["body", t.body],
    ["soul", t.soul],
  ] as const;

  for (let i = 0; i < cats.length; i++) {
    for (let j = i + 1; j < cats.length; j++) {
      const d = deltaE(cats[i]![1], cats[j]![1]);
      if (d < MIN_DELTA_E) {
        failures.push(
          `${themeName}: ${cats[i]![0]} vs ${cats[j]![0]} dE ${d.toFixed(1)} < ${MIN_DELTA_E}`,
        );
      }
    }
  }

  for (const [name, hex] of cats) {
    const dl = Math.abs(lightness(hex) - lightness(t.tileEmpty));
    if (dl < MIN_DELTA_L) {
      failures.push(
        `${themeName}: ${name} vs empty tile dL* ${dl.toFixed(1)} < ${MIN_DELTA_L}`,
      );
    }
  }

  const inks = [
    ["mind-ink", t.mindInk],
    ["body-ink", t.bodyInk],
    ["soul-ink", t.soulInk],
  ] as const;

  for (const [name, hex] of inks) {
    const ratio = contrast(hex, t.surface);
    if (ratio < MIN_TEXT_CONTRAST) {
      failures.push(
        `${themeName}: ${name} on surface ${ratio.toFixed(2)}:1 < ${MIN_TEXT_CONTRAST}:1`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Palette check FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("Palette check passed.");
```

- [ ] **Step 2: Wire it into `package.json`**

In `"scripts"`, add `check:palette` and extend `check`:

```json
"check": "next lint && tsc --noEmit && pnpm check:palette",
"check:palette": "tsx scripts/check-palette.ts"
```

`tsx` is already a devDependency — it runs the existing `db:seed` script.

- [ ] **Step 3: Run it**

Run: `pnpm check:palette`
Expected: `Palette check passed.`

If any line fails, **stop and report it** — do not edit the approved category colours. The `*-ink` variants may be adjusted to pass, since they were derived rather than approved.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-palette.ts package.json
git commit -m "test(design): enforce mosaic palette rules in pnpm check"
```

---

## Task 4: Shared primitives

**Files:**
- Create: `src/_components/ui/primitives/card.tsx`, `stat.tsx`, `pill.tsx`, `checkbox.tsx`, `index.ts`

**Interfaces:**
- Produces: `<Card>`, `<Stat value label />`, `<Pill category />`, `<Checkbox checked onChange label />`.

- [ ] **Step 1: Create `card.tsx`**

```tsx
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] sm:p-[18px] ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `stat.tsx`**

```tsx
interface StatProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export function Stat({ value, label, accent = false }: StatProps) {
  return (
    <div>
      <div
        className={`tabular text-[30px] leading-none font-extrabold tracking-[-0.04em] ${
          accent ? "text-[var(--color-mind-ink)]" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase">
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `pill.tsx`**

```tsx
import { CATEGORY_LABELS } from "~/lib/constants";
import type { CategoryId } from "~/lib/types";

interface PillProps {
  category: CategoryId;
}

export function Pill({ category }: PillProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        backgroundColor: `color-mix(in srgb, var(--color-${category}) 14%, transparent)`,
        color: `var(--color-${category}-ink)`,
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `var(--color-${category})` }}
      />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
```

- [ ] **Step 4: Create `checkbox.tsx`**

The spring and the draw-in are the app's core feedback. `motion` respects `prefers-reduced-motion` automatically via `useReducedMotion`.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CheckboxProps {
  checked: boolean;
  category: string;
  disabled?: boolean;
}

export function Checkbox({ checked, category, disabled }: CheckboxProps) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      animate={reduce ? {} : { scale: checked ? [1, 0.88, 1] : 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2"
      style={{
        borderColor: checked
          ? `var(--color-${category})`
          : "var(--color-hairline)",
        backgroundColor: checked ? `var(--color-${category})` : "transparent",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <motion.svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        initial={false}
      >
        <motion.path
          d="M2 6.2 L4.8 9 L10 3"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.18 }}
        />
      </motion.svg>
    </motion.span>
  );
}
```

- [ ] **Step 5: Create `index.ts`**

```ts
export { Card } from "./card";
export { Checkbox } from "./checkbox";
export { Pill } from "./pill";
export { Stat } from "./stat";
```

- [ ] **Step 6: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/_components/ui/primitives
git commit -m "feat(ui): add shared card/stat/pill/checkbox primitives"
```

---

## Task 5: Mosaic tile and legend

**Files:**
- Create: `src/_components/ui/mosaic/mosaic-tile.tsx`, `mosaic-legend.tsx`

**Interfaces:**
- Consumes: `tileBackground`, `isPerfectDay`, `DayCategories` from `~/lib/mosaic` (all created in Task 1).
- Produces: `<MosaicTile categories size radius pulse title onEnter onLeave />`; `<MosaicLegend />`.

- [ ] **Step 1: Create `mosaic-tile.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { isPerfectDay, tileBackground, type DayCategories } from "~/lib/mosaic";

interface MosaicTileProps {
  categories: DayCategories;
  /** px; the tile is square */
  size: number;
  radius: number;
  /** Pulse once — used when today's tile gains a band. */
  pulse?: boolean;
  title?: string;
  onEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onLeave?: () => void;
}

export function MosaicTile({
  categories,
  size,
  radius,
  pulse = false,
  title,
  onEnter,
  onLeave,
}: MosaicTileProps) {
  const reduce = useReducedMotion();
  const perfect = isPerfectDay(categories);

  return (
    <motion.div
      title={title}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={reduce || !pulse ? {} : { scale: [1, 1.18, 1] }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: tileBackground(categories),
        boxShadow: perfect
          ? "0 0 0 1.5px var(--color-canvas), 0 0 0 2.5px color-mix(in srgb, var(--color-ink) 30%, transparent)"
          : undefined,
      }}
    />
  );
}
```

- [ ] **Step 2: Create `mosaic-legend.tsx`**

```tsx
import { CATEGORY_IDS } from "~/lib/constants";
import { Pill } from "../primitives";

export function MosaicLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORY_IDS.map((id) => (
        <Pill key={id} category={id} />
      ))}
      <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-ink-muted)]">
        <span
          aria-hidden
          className="h-3 w-3 rounded-[3px]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-mind) 0% 33.333%, var(--color-body) 33.333% 66.667%, var(--color-soul) 66.667% 100%)",
            boxShadow:
              "0 0 0 1.5px var(--color-canvas), 0 0 0 2.5px color-mix(in srgb, var(--color-ink) 30%, transparent)",
          }}
        />
        Perfect day
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm check && pnpm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/_components/ui/mosaic
git commit -m "feat(mosaic): add tile and legend components"
```

---

## Task 6: Year view

**Files:**
- Create: `src/_components/ui/mosaic/mosaic-year.tsx`

**Interfaces:**
- Consumes: `<MosaicTile>`; `Map<string, DayCategories>`.
- Produces: `<MosaicYear completionMap onHover onLeave />`.

- [ ] **Step 1: Create `mosaic-year.tsx`**

Columns are weeks, rows are weekdays — the GitHub reading. 11px tiles, 3px gap, scrolls horizontally below `md`.

```tsx
"use client";

import { useMemo } from "react";
import type { DayCategories } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";
import { MosaicTile } from "./mosaic-tile";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };
const TILE = 11;
const GAP = 3;

interface MosaicYearProps {
  completionMap: Map<string, DayCategories>;
  onHover?: (date: Date, c: DayCategories, e: React.MouseEvent<HTMLElement>) => void;
  onLeave?: () => void;
  todayKey?: string;
  pulseToday?: boolean;
}

export function MosaicYear({
  completionMap,
  onHover,
  onLeave,
  todayKey,
  pulseToday = false,
}: MosaicYearProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    // Back up to the Sunday on or before Jan 1 so every column is a full week.
    start.setDate(start.getDate() - start.getDay());

    const cols: Date[][] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const col: Date[] = [];
      for (let d = 0; d < 7; d++) {
        col.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(col);
    }
    return cols;
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((col, i) => {
      const first = col[0]!;
      if (first.getMonth() !== lastMonth && first.getDate() <= 7) {
        lastMonth = first.getMonth();
        labels.push({
          index: i,
          label: first.toLocaleDateString("en-US", { month: "short" }),
        });
      }
    });
    return labels;
  }, [weeks]);

  const today = new Date();

  return (
    <div className="overflow-x-auto pb-1">
      <div style={{ minWidth: weeks.length * (TILE + GAP) }}>
        <div className="relative mb-1.5 h-3">
          {monthLabels.map((m) => (
            <span
              key={`${m.label}-${m.index}`}
              className="absolute text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase"
              style={{ left: m.index * (TILE + GAP) }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {weeks.map((col, i) => (
            <div key={i} className="flex flex-col" style={{ gap: GAP }}>
              {col.map((date) => {
                const key = formatDateAsLocal(date);
                const future = date > today;
                const categories = completionMap.get(key) ?? EMPTY;
                return (
                  <div key={key} style={{ opacity: future ? 0 : 1 }}>
                    <MosaicTile
                      categories={categories}
                      size={TILE}
                      radius={2}
                      pulse={pulseToday && key === todayKey}
                      onEnter={(e) => !future && onHover?.(date, categories, e)}
                      onLeave={onLeave}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/_components/ui/mosaic/mosaic-year.tsx
git commit -m "feat(mosaic): add year view"
```

---

## Task 7: Month and week views

**Files:**
- Create: `src/_components/ui/mosaic/mosaic-month.tsx`, `mosaic-week.tsx`

**Interfaces:**
- Produces: `<MosaicMonth completionMap />`, `<MosaicWeek completionMap />`. Both take the same `completionMap` as `MosaicYear`.

- [ ] **Step 1: Create `mosaic-month.tsx`**

```tsx
"use client";

import { useMemo } from "react";
import type { DayCategories } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";
import { MosaicTile } from "./mosaic-tile";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface MosaicMonthProps {
  completionMap: Map<string, DayCategories>;
}

export function MosaicMonth({ completionMap }: MosaicMonthProps) {
  const { cells, today } = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const out: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      out.push(new Date(now.getFullYear(), now.getMonth(), d));
    }
    return { cells: out, today: now };
  }, []);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-[7px]">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[7px]">
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />;
          const key = formatDateAsLocal(date);
          const future = date > today;
          const categories = completionMap.get(key) ?? EMPTY;
          return (
            <div
              key={key}
              className="relative"
              style={{ opacity: future ? 0.35 : 1 }}
            >
              <MosaicTile categories={categories} size={34} radius={8} />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--color-ink)] mix-blend-luminosity">
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `mosaic-week.tsx`**

```tsx
"use client";

import { useMemo } from "react";
import { CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";
import type { DayCategories } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";
import { MosaicTile } from "./mosaic-tile";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };

interface MosaicWeekProps {
  completionMap: Map<string, DayCategories>;
}

export function MosaicWeek({ completionMap }: MosaicWeekProps) {
  const days = useMemo(() => {
    const out: Date[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      out.push(d);
    }
    return out;
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {days.map((date) => {
          const key = formatDateAsLocal(date);
          const categories = completionMap.get(key) ?? EMPTY;
          const kept = CATEGORY_IDS.filter((id) => categories[id])
            .map((id) => CATEGORY_LABELS[id])
            .join(", ");
          return (
            <div key={key} className="text-center">
              <MosaicTile
                categories={categories}
                size={60}
                radius={12}
                title={kept || "Nothing kept"}
              />
              <div className="mt-2 text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/_components/ui/mosaic/mosaic-month.tsx src/_components/ui/mosaic/mosaic-week.tsx
git commit -m "feat(mosaic): add month and week views"
```

---

## Task 8: Mosaic shell, and delete the old graph

**Files:**
- Create: `src/_components/ui/mosaic/mosaic.tsx`, `src/_components/ui/mosaic/index.ts`
- Delete: `src/_components/ui/activity-graph.tsx`, `activity-graph-year-view.tsx`, `activity-graph-month-view.tsx`, `activity-graph-week-view.tsx`
- Modify: `src/_components/ui/index.ts`, `src/app/home/page.tsx`

**Interfaces:**
- Produces: `<Mosaic completions todayKey pulseToday />` where `completions: DayData[]`.

- [ ] **Step 1: Create `mosaic.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";
import type { DayCategories } from "~/lib/mosaic";
import type { DayData } from "~/lib/types";
import { Card } from "../primitives";
import { MosaicLegend } from "./mosaic-legend";
import { MosaicMonth } from "./mosaic-month";
import { MosaicWeek } from "./mosaic-week";
import { MosaicYear } from "./mosaic-year";

type ViewMode = "year" | "month" | "week";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "year", label: "Year" },
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
];

interface MosaicProps {
  completions: DayData[];
  todayKey?: string;
  pulseToday?: boolean;
}

interface Hovered {
  date: Date;
  categories: DayCategories;
  x: number;
  y: number;
}

export function Mosaic({ completions, todayKey, pulseToday }: MosaicProps) {
  const [view, setView] = useState<ViewMode>("year");
  const [hovered, setHovered] = useState<Hovered | null>(null);

  const completionMap = useMemo(() => {
    const map = new Map<string, DayCategories>();
    for (const c of completions) map.set(c.date, c.categories);
    return map;
  }, [completions]);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-[var(--color-ink)]">
          Your year
        </h2>

        <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--color-sunken)] p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`rounded-[8px] px-3 py-1 text-[12px] font-semibold ${
                view === v.id
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-card)]"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "year" && (
        <MosaicYear
          completionMap={completionMap}
          todayKey={todayKey}
          pulseToday={pulseToday}
          onHover={(date, categories, e) =>
            setHovered({
              date,
              categories,
              x: e.clientX,
              y: e.clientY,
            })
          }
          onLeave={() => setHovered(null)}
        />
      )}
      {view === "month" && <MosaicMonth completionMap={completionMap} />}
      {view === "week" && <MosaicWeek completionMap={completionMap} />}

      <div className="mt-4 border-t border-[var(--color-hairline)] pt-4">
        <MosaicLegend />
      </div>

      {completions.length === 0 && (
        <p className="mt-4 text-[13px] text-[var(--color-ink-muted)]">
          Nothing marked yet. Check off a habit and today lights up.
        </p>
      )}

      {hovered && view === "year" && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: hovered.x,
            top: hovered.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="rounded-[var(--radius-control)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-lift)]">
            <p className="mb-1.5 text-[12px] font-bold text-[var(--color-ink)]">
              {hovered.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <div className="flex flex-col gap-1">
              {CATEGORY_IDS.map((id) => (
                <div key={id} className="flex items-center gap-2 text-[11px]">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `var(--color-${id})` }}
                  />
                  <span className="text-[var(--color-ink-muted)]">
                    {CATEGORY_LABELS[id]}
                  </span>
                  <span className="ml-auto font-semibold text-[var(--color-ink)]">
                    {hovered.categories[id] ? "Kept" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Create `src/_components/ui/mosaic/index.ts`**

```ts
export { Mosaic } from "./mosaic";
export { MosaicLegend } from "./mosaic-legend";
export { MosaicMonth } from "./mosaic-month";
export { MosaicTile } from "./mosaic-tile";
export { MosaicWeek } from "./mosaic-week";
export { MosaicYear } from "./mosaic-year";
```

- [ ] **Step 3: Point `/home` at the new component**

In `src/app/home/page.tsx`, replace the `ActivityGraph` import with `import { Mosaic } from "~/_components/ui/mosaic";` and swap the JSX `<ActivityGraph completions={graphData} />` for `<Mosaic completions={graphData} />`. The page is fully rewritten in Task 13; this step only keeps the build green.

- [ ] **Step 4: Delete the old graph files**

```bash
git rm src/_components/ui/activity-graph.tsx \
       src/_components/ui/activity-graph-year-view.tsx \
       src/_components/ui/activity-graph-month-view.tsx \
       src/_components/ui/activity-graph-week-view.tsx
```

- [ ] **Step 5: Update the UI barrel**

In `src/_components/ui/index.ts`, remove the `ActivityGraph` export and add:

```ts
export { Mosaic } from "./mosaic";
```

- [ ] **Step 6: Verify**

Run: `pnpm check && pnpm test`
Expected: PASS. No file should still import `activity-graph`. Confirm with:

```bash
grep -rn "activity-graph" src || echo "clean"
```

- [ ] **Step 7: Commit**

```bash
git add -A src/_components/ui src/app/home/page.tsx
git commit -m "feat(mosaic): add shell with view switching, replace activity-graph"
```

---

## Task 9: Rebuild the check-in list

**Files:**
- Modify: `src/_components/ui/checkin-list.tsx`, `src/_components/ui/confetti.tsx`

**Interfaces:**
- Consumes: `<Card>`, `<Checkbox>`, `<Pill>` from primitives.
- Produces: `<CheckinList habits onToggle isLoading />` — the `justCompleted` prop is dropped, since the animation is now driven by `isCompleted` directly.

- [ ] **Step 1: Move `canvas-confetti` to real dependencies**

It is currently in `devDependencies` while being imported by client runtime code, so a production-only install would fail to build.

```bash
pnpm remove canvas-confetti && pnpm add canvas-confetti@^1.9.4
```

`@types/canvas-confetti` correctly stays in `devDependencies`.

- [ ] **Step 2: Rewrite `src/_components/ui/confetti.tsx`**

Three problems with the current file: the parent has no way to know when it finished (so it hacks a 100ms reset), it fires whenever `trigger` is truthy on any re-render rather than on the rising edge, and it uses the retired paper hexes.

```tsx
"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

interface ConfettiProps {
  /** Rising edge (false -> true) fires the burst. */
  trigger: boolean;
  /** Called once the burst finishes so the parent can reset `trigger`. */
  onDone?: () => void;
}

const COLORS = ["#6c5ce7", "#f2542d", "#0fa47f", "#9c8fff", "#35c9a3"];
const DURATION = 2400;

export function Confetti({ trigger, onDone }: ConfettiProps) {
  const wasTriggered = useRef(false);
  // Held in a ref so the effect never re-subscribes when the parent
  // re-renders with a new closure.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const rising = trigger && !wasTriggered.current;
    wasTriggered.current = trigger;
    if (!rising) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onDoneRef.current?.();
      return;
    }

    const end = Date.now() + DURATION;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: COLORS,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = end - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onDoneRef.current?.();
        return;
      }

      const particleCount = 50 * (timeLeft / DURATION);

      void confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      void confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [trigger]);

  return null;
}
```

- [ ] **Step 3: Rewrite `checkin-list.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CategoryId, HabitWithStatus } from "~/lib/types";
import { Card, Checkbox, Pill } from "./primitives";
import { Confetti } from "./confetti";

interface CheckinListProps {
  habits: HabitWithStatus[];
  onToggle: (habitId: number) => void;
  isLoading: boolean;
}

export function CheckinList({ habits, onToggle, isLoading }: CheckinListProps) {
  const reduce = useReducedMotion();
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const [celebrate, setCelebrate] = useState(false);
  const wasAllDone = useRef(allDone);

  useEffect(() => {
    // Fire only on the transition INTO a complete day, never on mount and
    // never repeatedly while it stays complete.
    if (allDone && !wasAllDone.current) setCelebrate(true);
    wasAllDone.current = allDone;
  }, [allDone]);

  return (
    <Card>
      <Confetti trigger={celebrate} onDone={() => setCelebrate(false)} />

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-[var(--color-ink)]">
          Today
        </h2>
        <span className="tabular text-[12px] font-bold text-[var(--color-ink-muted)]">
          {completedCount} of {totalCount}
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-sunken)]">
        <motion.div
          className="h-full rounded-full bg-[var(--color-mind)]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 30 }
          }
        />
      </div>

      <ul>
        {habits.map((habit) => {
          const categoryId = habit.category.id as CategoryId;
          const done = habit.isCompleted;

          return (
            <li
              key={habit.id}
              className="border-b border-[var(--color-hairline)] last:border-0"
            >
              <button
                role="checkbox"
                aria-checked={done}
                aria-label={`${habit.name} — ${done ? "kept" : "not kept"}`}
                onClick={() => onToggle(habit.id)}
                disabled={isLoading}
                className="flex w-full items-center gap-3 py-3 text-left disabled:opacity-50"
              >
                <Checkbox
                  checked={done}
                  category={categoryId}
                  disabled={isLoading}
                />

                <span className="min-w-0 flex-1">
                  <span className="relative inline-block text-[14px] font-semibold text-[var(--color-ink)]">
                    <span style={{ opacity: done ? 0.45 : 1 }}>
                      {habit.name}
                    </span>
                    <motion.span
                      aria-hidden
                      className="absolute top-1/2 left-0 h-[1.5px] bg-[var(--color-ink-faint)]"
                      initial={false}
                      animate={{ width: done ? "100%" : "0%" }}
                      transition={reduce ? { duration: 0 } : { duration: 0.22 }}
                    />
                  </span>
                  {habit.description && (
                    <span className="mt-0.5 block text-[12px] text-[var(--color-ink-muted)]">
                      {habit.description}
                    </span>
                  )}
                </span>

                <Pill category={categoryId} />
              </button>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="mt-4 text-center text-[13px] font-semibold text-[var(--color-ink-muted)]">
          Every one of them. Nice.
        </p>
      )}
    </Card>
  );
}
```

- [ ] **Step 4: Update the caller**

In `src/app/home/page.tsx`, remove `justCompleted={justCompleted}` from the `<CheckinList>` usage.

- [ ] **Step 5: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/_components/ui/checkin-list.tsx src/_components/ui/confetti.tsx src/app/home/page.tsx package.json pnpm-lock.yaml
git commit -m "feat(checkin): rebuild check-in list with spring feedback, fix confetti trigger"
```

---

## Task 10: Sidebar and user button

**Files:**
- Modify: `src/_components/ui/sidebar.tsx`, `src/_components/ui/user-button.tsx`

- [ ] **Step 1: Restyle `sidebar.tsx`**

Three changes, all in the existing structure:

1. **Fix the width bug.** The aside is `w-60` (240px) while `/home` offsets `md:ml-64` (256px) — a permanent 16px misalignment. Keep the aside at `w-60` and change the page offset to `md:ml-60` in Task 13.
2. **Drop the "Navigate" eyebrow block** entirely (the `<div className="px-6 pt-6 pb-2">` and its span).
3. **Swap tokens and the active state.** Replace every `border-black/8`/`dark:border-white/8` with `border-[var(--color-hairline)]`, every paper/ink token with the new equivalents, and replace the 2px edge bar with a filled pill:

```tsx
<Link
  key={item.href}
  href={item.href}
  onClick={() => setMobileOpen(false)}
  className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-[13px] font-semibold ${
    isActive
      ? "bg-[var(--color-sunken)] text-[var(--color-ink)]"
      : "text-[var(--color-ink-muted)] hover:bg-[var(--color-sunken)] hover:text-[var(--color-ink)]"
  }`}
>
  {item.label}
</Link>
```

Also update the wordmark: the dot becomes `bg-[var(--color-mind)]`, and the text becomes `text-[20px] font-extrabold tracking-[-0.02em]` with no `font-serif` and no `italic`. The aside background becomes `bg-[var(--color-canvas)]`.

- [ ] **Step 2: Restyle `user-button.tsx`**

Read the file, then replace its 18 paper-token references with the new equivalents: `--color-paper-raised`/`--color-paper-dark-raised` → `--color-surface`; `--color-ink-muted`/`--color-ink-dark-muted` → `--color-ink-muted`; `--color-ink`/`--color-ink-dark` → `--color-ink`; `border-black/8`/`dark:border-white/8` → `border-[var(--color-hairline)]`. Remove any `font-serif` or `italic`. Menu surfaces get `rounded-[var(--radius-control)]` and `shadow-[var(--shadow-lift)]`.

- [ ] **Step 3: Verify no paper tokens remain in these two files**

```bash
grep -nE "color-paper|ink-dark|color-ember|font-serif" \
  src/_components/ui/sidebar.tsx src/_components/ui/user-button.tsx \
  || echo "clean"
```

Expected: `clean`.

- [ ] **Step 4: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/_components/ui/sidebar.tsx src/_components/ui/user-button.tsx
git commit -m "feat(nav): bring sidebar and user button into the new system"
```

---

## Task 11: Mood tracker restyle

**Files:**
- Modify: `src/_components/ui/mood-tracker.tsx`

**Do not touch the tRPC queries, the mutation, or the optimistic-update logic** (lines ~24–130). This task is presentation only.

- [ ] **Step 1: Replace the container with `<Card>`**

Import `Card` from `./primitives` and use it as the outermost element, removing the hand-rolled `rounded-[12px] border ... bg-[var(--color-paper-raised)]` wrapper.

- [ ] **Step 2: Swap every token**

Across the file's 41 paper-token references: `--color-paper-raised`/`--color-paper-dark-raised` → `--color-surface`; `--color-paper`/`--color-paper-dark` → `--color-canvas`; `--color-ink-dark` → `--color-ink`; `--color-ink-dark-muted` → `--color-ink-muted`; `--color-ember` → `--color-mind`; `border-black/8` and `dark:border-white/8` → `border-[var(--color-hairline)]`. Delete every `font-serif`, `italic`, and `fontOpticalSizing` usage. Headings become `text-[22px] font-bold tracking-[-0.02em]`; the week/year toggle adopts the same segmented-control markup used in `mosaic.tsx` Step 1.

- [ ] **Step 3: Verify no paper tokens remain**

```bash
grep -nE "color-paper|ink-dark|color-ember|font-serif" \
  src/_components/ui/mood-tracker.tsx || echo "clean"
```

Expected: `clean`.

- [ ] **Step 4: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/_components/ui/mood-tracker.tsx
git commit -m "feat(mood): restyle mood tracker to the new design system"
```

---

## Task 12: Home sub-components

**Files:**
- Create: `src/_components/ui/home/home-header.tsx`, `home-skeleton.tsx`, `home-empty.tsx`, `index.ts`

**Interfaces:**
- Produces: `<HomeHeader name streak />`, `<HomeSkeleton />`, `<HomeEmpty />`.

- [ ] **Step 1: Create `home-header.tsx`**

```tsx
import { Card } from "../primitives";

interface HomeHeaderProps {
  name: string;
  streak: number;
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function HomeHeader({ name, streak }: HomeHeaderProps) {
  const today = new Date();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 text-[28px] leading-[1.05] font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-[34px]">
          Good {timeOfDay()}, {name}
        </h1>
      </div>

      <Card className="shrink-0 text-center">
        <div className="tabular text-[30px] leading-none font-extrabold tracking-[-0.04em] text-[var(--color-mind-ink)]">
          {streak}
        </div>
        <div className="mt-1 text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase">
          day streak
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create `home-skeleton.tsx`**

```tsx
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      <div className="h-16 w-2/3 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
      <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
      <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
      <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
    </div>
  );
}
```

- [ ] **Step 3: Create `home-empty.tsx`**

```tsx
import Link from "next/link";
import { CATEGORY_IDS, CATEGORY_DESCRIPTIONS } from "~/lib/constants";
import { Card, Pill } from "../primitives";

export function HomeEmpty() {
  return (
    <Card>
      <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-[var(--color-ink)]">
        Start with one habit
      </h2>
      <p className="mt-2 text-[14px] text-[var(--color-ink-muted)]">
        Northstar tracks three parts of your life. Every day you show up for one
        of them, that day lights up in your mosaic.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {CATEGORY_IDS.map((id) => (
          <div key={id} className="flex items-center gap-3">
            <Pill category={id} />
            <span className="text-[13px] text-[var(--color-ink-muted)]">
              {CATEGORY_DESCRIPTIONS[id]}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/habits"
        className="mt-5 inline-block rounded-[var(--radius-control)] bg-[var(--color-mind)] px-5 py-2.5 text-[13px] font-bold text-white"
      >
        Create your first habit
      </Link>
    </Card>
  );
}
```

- [ ] **Step 4: Create `index.ts`**

```ts
export { HomeEmpty } from "./home-empty";
export { HomeHeader } from "./home-header";
export { HomeSkeleton } from "./home-skeleton";
```

- [ ] **Step 5: Verify**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/_components/ui/home
git commit -m "feat(home): add header, skeleton and empty-state components"
```

---

## Task 13: Recompose `/home`

**Files:**
- Modify: `src/app/home/page.tsx` (full rewrite, 559 → ~130 lines)

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckinList } from "~/_components/ui/checkin-list";
import { HomeEmpty, HomeHeader, HomeSkeleton } from "~/_components/ui/home";
import { Mosaic } from "~/_components/ui/mosaic";
import { MoodTracker } from "~/_components/ui/mood-tracker";
import { Card, Stat } from "~/_components/ui/primitives";
import { Sidebar } from "~/_components/ui/sidebar";
import { useGraphData } from "~/hooks/use-graph-data";
import { useHabitCompletion } from "~/hooks/use-habit-completion";
import { CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";
import { getCurrentYearRange, getTodayDate } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = useMemo(() => getTodayDate(), []);
  const dateRange = useMemo(() => getCurrentYearRange(), []);

  const { data: habitsWithStatus, isError: habitsError } =
    api.completion.getForDate.useQuery({ date: today }, { enabled: !!today });

  const { data: stats } = api.completion.getStatsForDate.useQuery(
    { date: today },
    { enabled: !!today },
  );

  const { data: completionsData, isError: completionsError } =
    api.completion.getMyCompletions.useQuery({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

  const { data: overallStats, isError: statsError } =
    api.completion.getOverallStats.useQuery();

  const graphData = useGraphData(completionsData);
  const { handleToggle, toggleMutation } = useHabitCompletion({
    today,
    dateRange,
  });

  // getMyCompletions is optimistically updated in use-habit-completion, so
  // today's tile already reflects a check-off. This just pulses it when the
  // count changes.
  const completedToday =
    habitsWithStatus?.filter((h) => h.isCompleted).length ?? 0;
  const [pulseToday, setPulseToday] = useState(false);
  const prevCompleted = useRef(completedToday);

  useEffect(() => {
    if (completedToday > prevCompleted.current) {
      setPulseToday(true);
      const t = setTimeout(() => setPulseToday(false), 500);
      prevCompleted.current = completedToday;
      return () => clearTimeout(t);
    }
    prevCompleted.current = completedToday;
  }, [completedToday]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-[var(--color-canvas)]">
        <div className="flex-1 md:ml-60">
          <main className="mx-auto max-w-4xl px-5 pt-8 pb-24 sm:px-6 lg:px-8">
            <HomeSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const hasError = habitsError || completionsError || statsError;
  const hasHabits = (habitsWithStatus?.length ?? 0) > 0;

  const counts = CATEGORY_IDS.reduce(
    (acc, id) => {
      acc[id] = stats?.byCategory.find((c) => c.category.id === id)?.count ?? 0;
      return acc;
    },
    {} as Record<(typeof CATEGORY_IDS)[number], number>,
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Sidebar user={session.user} />

      <div className="flex-1 md:ml-60">
        <main className="mx-auto flex max-w-4xl flex-col gap-3 px-5 pt-8 pb-24 sm:px-6 lg:px-8">
          {hasError && (
            <div className="rounded-[var(--radius-control)] border border-[var(--color-body)]/30 bg-[var(--color-body)]/10 px-4 py-3 text-[13px] font-semibold text-[var(--color-body-ink)]">
              Something went wrong loading your data. Please refresh the page.
            </div>
          )}

          <div className="animate-rise-in mb-1">
            <HomeHeader
              name={session.user.name?.split(" ")[0] ?? "friend"}
              streak={overallStats?.currentStreak ?? 0}
            />
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "60ms" }}>
            {hasHabits ? (
              <CheckinList
                habits={habitsWithStatus!}
                onToggle={handleToggle}
                isLoading={toggleMutation.isPending}
              />
            ) : (
              <HomeEmpty />
            )}
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "120ms" }}>
            <Mosaic
              completions={graphData}
              todayKey={today}
              pulseToday={pulseToday}
            />
          </div>

          <div
            className="animate-rise-in grid grid-cols-3 gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <Card>
              <Stat value={`${overallStats?.weekPercentage ?? 0}%`} label="This week" />
            </Card>
            <Card>
              <Stat value={overallStats?.totalCompleted ?? 0} label="Total days" />
            </Card>
            <Card>
              <Stat value={overallStats?.bestStreak ?? 0} label="Best streak" />
            </Card>
          </div>

          <div
            className="animate-rise-in grid grid-cols-3 gap-3"
            style={{ animationDelay: "240ms" }}
          >
            {CATEGORY_IDS.map((id) => (
              <Card key={id}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `var(--color-${id})` }}
                  />
                  <span className="text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase">
                    {CATEGORY_LABELS[id]}
                  </span>
                </div>
                <div className="tabular text-[30px] leading-none font-extrabold tracking-[-0.04em]">
                  {counts[id]}
                </div>
              </Card>
            ))}
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "300ms" }}>
            <MoodTracker />
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no paper tokens remain**

```bash
grep -nE "color-paper|ink-dark|color-ember|font-serif" src/app/home/page.tsx \
  || echo "clean"
```

Expected: `clean`.

- [ ] **Step 3: Verify**

Run: `pnpm check && pnpm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/home/page.tsx
git commit -m "feat(home): recompose page around the mosaic hero"
```

---

## Task 14: Cleanup and final verification

**Files:**
- Modify: `src/lib/constants.ts`, `src/_components/ui/index.ts`

- [ ] **Step 1: Check whether `CATEGORY_COLORS` is still referenced**

```bash
grep -rn "CATEGORY_COLORS" src || echo "unused"
```

If it reports `unused`, delete the `CATEGORY_COLORS` export from `src/lib/constants.ts`. **If any out-of-scope file still uses it, leave it in place** and add a comment noting it is removed when those pages migrate. Do not modify out-of-scope pages to force its removal.

- [ ] **Step 2: Update the UI barrel**

Ensure `src/_components/ui/index.ts` exports the new modules and no deleted ones:

```ts
export { CategoryStatCard } from "./category-stat-card";
export { CheckinList } from "./checkin-list";
export { Confetti } from "./confetti";
export { HabitsList } from "./habits-list";
export { Mosaic } from "./mosaic";
export { MoodTracker } from "./mood-tracker";
export { ProgressBar, ProgressBarWithLabel } from "./progress-bar";
export { Sidebar } from "./sidebar";
export { StatsCards } from "./stats-cards";
export { UserButton } from "./user-button";
```

- [ ] **Step 3: Full static verification**

```bash
pnpm check && pnpm test && pnpm build
```

Expected: all pass.

- [ ] **Step 4: Confirm out-of-scope pages are untouched**

```bash
git diff --stat main -- src/app/page.tsx src/app/habits src/app/signin src/app/signup
```

Expected: no output. If any of these changed, revert them.

- [ ] **Step 5: Manual visual verification**

Run `pnpm dev`, sign in, seed data with `pnpm db:seed` if the account is empty, then check `/home`:

- Light and dark, at 375px, 768px and 1440px.
- The year row at real density — confirm three-way splits are distinguishable, not mud. **This is the accepted risk from spec §3.3.** If it fails, stop and report rather than improvising the fallback.
- Check off a habit: the checkbox springs, the checkmark draws, the name strikes through, the progress bar animates, and today's tile pulses and gains its band.
- Complete every habit: confetti fires exactly once, and today's tile shows the perfect-day ring.
- Toggle a habit off and on again: confetti fires again on re-completion, and only once.
- Enable "Reduce motion" in OS settings and repeat: no movement, only opacity changes.
- Visit `/habits` and the landing page to confirm they still render as before.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(design): tidy barrels and remove dead category colour map"
```

---

## Deferred to the follow-up pass

Recorded so they are not silently lost:

1. Migrate `/habits`, the landing page, `/signin` and `/signup` to the new system.
2. Then delete the `DEPRECATED` block in `globals.css`, remove Fraunces from `layout.tsx`, and drop `CATEGORY_COLORS` and `CATEGORY_HEX` if they survived Task 14.
3. Restyle `progress-bar`, `stats-cards`, `category-stat-card`, `category-badge` and `habits-list`, which are used only by out-of-scope pages.
4. Revisit year-view legibility with real long-term data; build the dominant-tone fallback only if it proves necessary.

---

## Task 15: Build the type scale and adopt the primitives

**Added after the final whole-branch review, which found the spec's §2.2 type scale was
specified but never built — so its literal class strings were copy-pasted instead, and have
already diverged. Approved by the repo owner for this branch.**

**Files:**
- Modify: `src/styles/globals.css`, `src/_components/ui/home/home-header.tsx`, `src/app/home/page.tsx`, `src/_components/ui/primitives/stat.tsx`, `src/_components/ui/mosaic/mosaic.tsx`, `src/_components/ui/mosaic/mosaic-year.tsx`, `src/_components/ui/mosaic/mosaic-month.tsx`, `src/_components/ui/mosaic/mosaic-week.tsx`, `src/_components/ui/mosaic/mosaic-legend.tsx`, `src/_components/ui/checkin-list.tsx`, `src/_components/ui/mood-tracker.tsx`, `src/_components/ui/home/home-empty.tsx`, `src/hooks/use-graph-data.ts`

- [ ] **Step 1: Add the type scale to `@theme`**

Tailwind v4 generates a `text-*` utility from a `--text-*` entry, including its paired
line-height, letter-spacing and weight. Add to the `@theme` block in `globals.css`:

```css
  /* Type scale — spec §2.2. These replace ~15 copy-pasted literal class strings. */
  --text-eyebrow: 10px;
  --text-eyebrow--line-height: 1;
  --text-eyebrow--letter-spacing: 0.1em;
  --text-eyebrow--font-weight: 700;

  --text-title: 22px;
  --text-title--line-height: 1.2;
  --text-title--letter-spacing: -0.02em;
  --text-title--font-weight: 700;

  --text-stat: 30px;
  --text-stat--line-height: 1;
  --text-stat--letter-spacing: -0.04em;
  --text-stat--font-weight: 800;

  --text-display: 34px;
  --text-display--line-height: 1.05;
  --text-display--letter-spacing: -0.03em;
  --text-display--font-weight: 800;
```

Colour and `uppercase` stay at the call site, since they vary.

- [ ] **Step 2: Sweep the call sites**

Replace every occurrence of the literal strings with the new utility. Colour classes stay.

- `text-[10px] font-bold tracking-[0.1em] ... uppercase` → `text-eyebrow uppercase` (7 sites:
  `home/page.tsx`, `home-header.tsx`, `stat.tsx`, `mosaic-year.tsx`, `mosaic-month.tsx`,
  `mosaic-week.tsx`, and the legend)
- `text-[22px] ... font-bold tracking-[-0.02em]` → `text-title` (5 sites: `mosaic.tsx`,
  `home-empty.tsx`, `checkin-list.tsx`, and two in `mood-tracker.tsx`)
- `text-[30px] leading-none font-extrabold tracking-[-0.04em]` → `text-stat` (3 sites)
- The `/home` greeting's `text-[28px] sm:text-[34px]` keeps its responsive step: use
  `text-[28px] sm:text-display`.

**Resolve the existing divergence deliberately:** three title sites carry `leading-tight` and
two do not. `--text-title--line-height: 1.2` is close to `leading-tight` (1.25), so drop the
stray `leading-tight` classes and let the token govern. Note the change in the report.

- [ ] **Step 3: Use the `Stat` primitive instead of reimplementing it**

`Stat` is currently used at only one of its three natural call sites.

- `home-header.tsx` reimplements it verbatim including the accent — replace with
  `<Stat value={streak} label="day streak" accent />`.
- `src/app/home/page.tsx`'s category-breakdown cards reimplement the value half — use `Stat`
  where it fits. If a call site genuinely needs markup `Stat` can't express, **do not**
  contort `Stat` with new props: leave that site alone and say why in your report.

- [ ] **Step 4: Fix two small consistency defects the review found**

- `mood-tracker.tsx` uses `h3` for card headings while every sibling card uses `h2` under the
  page `h1` — a heading-level skip. Change to `h2`.
- `src/hooks/use-graph-data.ts` re-declares the `{ mind, body, soul }` object literal instead
  of importing `DayCategories` from `~/lib/types` — the exact drift that type exists to
  prevent. Import it.

- [ ] **Step 5: Verify**

`pnpm check` exits 0, `pnpm test` 6/6, `pnpm build` succeeds.

Then confirm the sweep is complete — these should return nothing:

```bash
grep -rn 'text-\[10px\].*tracking-\[0\.1em\]' src
grep -rn 'text-\[22px\].*tracking-\[-0\.02em\]' src
grep -rn 'text-\[30px\].*tracking-\[-0\.04em\]' src
```

- [ ] **Step 6: Commit**

```bash
git add -A src docs
git commit -m "refactor(design): build the type scale as tokens and adopt Stat

The spec defined a six-step scale to replace ad-hoc pixel sizes, but it was
never built, so the literal strings were copy-pasted across ~15 call sites and
had already diverged on line-height."
```

---

## Task 16: One segmented control, month tooltips, and orphan cleanup

**Also added after the final whole-branch review. Approved by the repo owner.**

**Files:**
- Create: `src/_components/ui/primitives/segmented-control.tsx`
- Modify: `src/_components/ui/primitives/index.ts`, `src/_components/ui/mosaic/mosaic.tsx`, `src/_components/ui/mood-tracker.tsx`, `src/_components/ui/mosaic/mosaic-month.tsx`, `src/_components/ui/mosaic/mosaic-week.tsx`, `src/lib/mosaic.ts`, `src/lib/mosaic.test.ts`, `src/hooks/use-habit-completion.ts`, `src/lib/constants.ts`, `src/styles/globals.css`
- Delete: `src/_components/ui/index.ts`

- [ ] **Step 1: Extract the segmented control**

It is currently built twice, in `mosaic.tsx` and `mood-tracker.tsx`. Create one primitive:

```tsx
interface SegmentedControlProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}
```

It must keep the existing visuals exactly (`bg-[var(--color-sunken)]` container, `rounded-[var(--radius-control)]`, active segment `bg-[var(--color-surface)]` with `shadow-[var(--shadow-card)]`), and keep the `aria-pressed` and `type="button"` added in the last fix wave. Adopt it in both call sites.

Note `mosaic.tsx` also clears hover state on switch — preserve that behaviour by doing it in the `onChange` handler, not inside the primitive.

- [ ] **Step 2: Give the month view a tooltip, and de-duplicate the "kept" text**

`MosaicWeek` computes a human-readable list of kept categories inline; `MosaicMonth` has no
tooltip at all, despite being the view where a user is most likely to interrogate a specific
day. Move that computation into `src/lib/mosaic.ts`:

```ts
/** Human-readable list of kept categories, e.g. "Mind, Soul". */
export function keptLabel(c: DayCategories): string
```

Return `"Nothing kept"` when none are set. Add unit tests for it in `mosaic.test.ts` covering
none / one / two / all three. Use it in both `MosaicWeek` and `MosaicMonth` as the tile `title`.

- [ ] **Step 3: Clear the orphans the review found**

Each is dead; verify before removing and report what you found:

- `src/hooks/use-habit-completion.ts` — `justCompleted` state, its `setTimeout`, and its
  return value have had no consumer since `CheckinList` dropped the prop. Remove all three.
- `src/lib/constants.ts` — `CATEGORY_HEX_DARK` is exported and never read.
- `src/styles/globals.css` — `--radius-tile-year/month/week` are unused (the views hard-code
  the numbers) and `--duration-base` is unused. **Prefer wiring the radius tokens up** at
  `mosaic-year.tsx`, `mosaic-month.tsx` and `mosaic-week.tsx` rather than deleting them —
  that is what they were for. Delete `--duration-base` if nothing uses it.
- `src/_components/ui/index.ts` — has zero consumers (`grep 'from "~/_components/ui"'`
  returns nothing). Delete the file rather than maintain a barrel nobody imports.

- [ ] **Step 4: Verify**

`pnpm check` exits 0, `pnpm test` passes (now more than 6 — report the count), `pnpm build`
succeeds. Confirm `grep -rn "justCompleted\|CATEGORY_HEX_DARK" src` returns nothing.

- [ ] **Step 5: Commit**

```bash
git add -A src docs
git commit -m "refactor(ui): share the segmented control, add month tooltips, drop orphans"
```

---

## Outstanding after merge

Recorded here so they survive in git rather than only in the execution scratchpad.

**1. Manual browser verification — never performed.** The checkbox squish fix
(`primitives/checkbox.tsx`, tween instead of spring) is verified only statically. The agent
that attempted the runtime check hit a signed-out session and correctly declined to submit a
sign-in form with credentials that were not its own; no dev/test account exists, because
`scripts/seed.ts` requires an already-registered user. Confirm, signed in:
   - the checkbox squish visibly animates on click;
   - the console is free of framer-motion's "Only two keyframes currently supported with
     spring animations" warning;
   - **the progress bar and the strikethrough both animate on a live click** — this was the
     original symptom, so it is the real proof;
   - reduced motion still fully disables movement.

   This matters more than it sounds: the bug it fixes was invisible to four separate diff
   reviews and only surfaced when an agent drove a real browser.

**2. Year-view legibility at real density.** Three-way tile splits at 11px were reviewed at
mock scale and approved, never with a full year of real data. If they read as mud, the agreed
fallback — already decided, not built — is that the year view collapses to a dominant category
tone while month and week keep true splits.

**3. Four dead components, pre-existing.** `category-badge.tsx`, `category-stat-card.tsx`,
`progress-bar.tsx` and `stats-cards.tsx` have no consumers. Verified dead at merge-base
`548dc47` too, so this branch did not orphan them — deleting the unused `ui/index.ts` barrel
merely made it visible. `habits-list.tsx` is still live (used by `/habits`).

**4. Remaining accessibility gaps.** Mosaic tiles are hover-only, with no keyboard path to the
per-day tooltip (pre-existing — the old graph had the same gap), and the sidebar's active nav
link has no `aria-current` (also pre-existing). The `aria-pressed`, `type="button"` and
`role="alert"` gaps found in review were fixed.

**5. The DEPRECATED block still stands.** `globals.css` retains the paper tokens and
`layout.tsx` retains Fraunces, because the landing page, `/habits`, `/signin` and `/signup`
still consume them. They come out in the pass that migrates those four surfaces — which is
also when the type scale built in Task 15 gets its real test.
