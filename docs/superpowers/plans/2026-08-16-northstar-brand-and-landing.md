# Northstar Brand & Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing page's printed-almanac composition with a brand identity and an interactive mosaic hero that teaches the product in three seconds.

**Architecture:** Pure logic lives in `src/lib/` and is unit-tested; presentation lives in `src/_components/landing/` and is not (the repo has no component-test harness — see Global Constraints). The brand mark is emitted by the existing `tileBackground` rather than drawn, so the logo cannot drift from the product. Exactly one landing component is a client component.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v4 (CSS-first `@theme`), framer-motion 12, Vitest 3, `next/font/google`.

## Global Constraints

- **Vitest only collects `src/**/*.test.ts`** (`vitest.config.ts:9`) — note `.ts`, **not** `.tsx`, and `environment: "node"`. There is no React testing library installed. Do not write component tests; they will not run. All test coverage in this plan is pure functions and source-file linting.
- **Palette hexes are frozen.** mind `#6c5ce7`, body `#f2542d`, soul `#0fa47f`, perfect `#d4a017` (light) / `#ffce54` (dark). Do not add or alter category hues.
- **Never build class names by interpolation.** Tailwind cannot see `` `from-${x}-50` ``. Use complete literal class names, or inline `style` with CSS custom properties. Task 3 adds a test that enforces this.
- **The mark must call `tileBackground()`**, never a hardcoded gradient string.
- **Every animation needs a `prefers-reduced-motion` path.** Non-negotiable.
- **Light-first, dark at parity.** Dark values are independently tuned, never inverted.
- Package manager is **pnpm**. Run `pnpm check` (lint + tsc + palette), `pnpm test`, `pnpm build`.
- Do **not** use the `Pill` primitive for nav buttons. `Pill` is a category badge taking only `category: CategoryId` (`primitives/pill.tsx`). Nav buttons are plain elements.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/landing-seed.ts` | Deterministic demo year generation. Pure. |
| `src/lib/landing-seed.test.ts` | Determinism + lopsidedness coverage. |
| `src/lib/landing-interaction.ts` | `toggleCategory` reducer. Pure. |
| `src/lib/landing-interaction.test.ts` | Toggle + perfect-day transitions. |
| `src/lib/brand.ts` | `markBackground()`, `markRadius()`. Pure. |
| `src/lib/brand.test.ts` | Mark derives from `tileBackground`. |
| `src/_components/landing/no-interpolated-classes.test.ts` | Guard against the finding-B bug class. |
| `src/_components/landing/brand-mark.tsx` | The tile logo. Server-safe. |
| `src/_components/landing/wordmark.tsx` | `northstar` lockup. |
| `src/_components/landing/landing-nav.tsx` | Mark + wordmark + two buttons. |
| `src/_components/landing/hero.tsx` | Wash, grain, headline. Server. |
| `src/_components/landing/interactive-year.tsx` | **Only** `"use client"` component. |
| `src/_components/landing/comparison.tsx` | GitHub green vs three colours. |
| `src/_components/landing/lopsided-month.tsx` | The "you can see it" argument. |
| `src/_components/landing/categories.tsx` | Three category cards. |
| `src/_components/landing/landing-cta.tsx` | Closing CTA. |
| `src/_components/landing/landing-footer.tsx` | **Rebuilt** on tokens. |
| `src/_components/landing/unified-demo.tsx` | **Deleted** in Task 3. |
| `src/_components/landing/reveal-on-scroll.tsx` | Progressive-enhancement scroll reveals. |
| `src/app/icon.svg` | The mark as favicon, in literal hexes. |
| `src/app/layout.tsx` | Fraunces wiring; drops the overriding `metadata.icons`. |
| `src/app/page.tsx` | Rewritten assembly. |
| `src/styles/globals.css` | Wash tokens, `.font-display`, `.reveal`, `.sr-only`. |

---

### Task 1: Deterministic demo year

The hero needs a plausible year that renders identically on server and client. `Math.random()` and ambient `new Date()` both break that. This task builds a seeded generator.

**Files:**
- Create: `src/lib/landing-seed.ts`
- Test: `src/lib/landing-seed.test.ts`

**Interfaces:**
- Consumes: `DayCategories` from `~/lib/types`, `formatDateAsLocal` from `~/lib/utils` (`utils.ts:57`, returns `YYYY-MM-DD`).
- Produces:
  - `buildDemoYear(reference: Date, days: number): Map<string, DayCategories>`
  - `LOPSIDED_MONTH_OFFSET: number` — months back from `reference` whose body density is suppressed.
  - `HERO_WEEKS = 20`, `HERO_DAYS = 140`

- [ ] **Step 1: Write the failing test**

Create `src/lib/landing-seed.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildDemoYear, HERO_DAYS, LOPSIDED_MONTH_OFFSET } from "./landing-seed";
import { activeCategories } from "./mosaic";

const REF = new Date(2026, 7, 16); // 16 Aug 2026, fixed

describe("buildDemoYear", () => {
  it("is deterministic across invocations", () => {
    const a = buildDemoYear(REF, HERO_DAYS);
    const b = buildDemoYear(REF, HERO_DAYS);
    expect([...a.entries()]).toEqual([...b.entries()]);
  });

  it("produces exactly the requested number of days, ending on the reference", () => {
    const map = buildDemoYear(REF, HERO_DAYS);
    expect(map.size).toBe(HERO_DAYS);
    expect(map.has("2026-08-16")).toBe(true);
  });

  it("leaves some days empty and makes some days perfect", () => {
    const map = buildDemoYear(REF, HERO_DAYS);
    const counts = [...map.values()].map((d) => activeCategories(d).length);
    expect(counts.some((n) => n === 0)).toBe(true);
    expect(counts.some((n) => n === 3)).toBe(true);
  });

  it("gives a date the same value regardless of window size", () => {
    // The hero asks for 140 days, the comparison 182, the lopsided month 365.
    // All three render on one page, so a date must not change between them.
    const short = buildDemoYear(REF, HERO_DAYS);
    const long = buildDemoYear(REF, 365);
    for (const [key, value] of short) {
      expect(long.get(key)).toEqual(value);
    }
  });

  it("suppresses body in the lopsided month, deliberately not by luck", () => {
    const map = buildDemoYear(REF, 365);
    const target = new Date(
      REF.getFullYear(),
      REF.getMonth() - LOPSIDED_MONTH_OFFSET,
      1,
    );
    const inMonth = [...map.entries()].filter(([key]) => {
      const [y, m] = key.split("-").map(Number);
      return y === target.getFullYear() && m === target.getMonth() + 1;
    });

    expect(inMonth.length).toBeGreaterThan(20);
    const body = inMonth.filter(([, d]) => d.body).length;
    const mind = inMonth.filter(([, d]) => d.mind).length;
    const soul = inMonth.filter(([, d]) => d.soul).length;

    expect(body * 3).toBeLessThan(mind);
    expect(body * 3).toBeLessThan(soul);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/landing-seed.test.ts`
Expected: FAIL — `Failed to resolve import "./landing-seed"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/landing-seed.ts`:

```ts
// A plausible year of demo data for the landing page.
//
// Deterministic by construction: seeded PRNG, no Math.random, no ambient Date.
// The landing hero is server-rendered and hydrated, so any nondeterminism here
// becomes a hydration mismatch rather than a visual nicety.

import type { DayCategories } from "./types";
import { formatDateAsLocal } from "./utils";

/** 7 rows x 20 columns of hero mosaic. */
export const HERO_WEEKS = 20;
export const HERO_DAYS = HERO_WEEKS * 7;

/** Months back from the reference date whose body density is suppressed, so
 *  the "lopsided month" section has something real to point at. */
export const LOPSIDED_MONTH_OFFSET = 3;

const SEED = 0x4e53; // "NS"

/** Small, fast, well-distributed 32-bit PRNG. Chosen over a hand-rolled LCG
 *  because low-bit correlation in an LCG shows up as visible striping when the
 *  output drives a grid. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_RATE: Record<keyof DayCategories, number> = {
  mind: 0.62,
  body: 0.48,
  soul: 0.55,
};

/** Body density inside the lopsided month. Low enough that the section's
 *  claim is visible at a glance, non-zero so it reads as a hard month rather
 *  than a rendering bug. */
const LOPSIDED_BODY_RATE = 0.08;

/** The generator always walks this many days, then slices. Varying the walk
 *  length would re-align the PRNG sequence against the calendar, so the same
 *  date would differ between the hero (140 days), the comparison (182) and the
 *  lopsided month (365) — three views of one year, disagreeing on one page. */
const CANONICAL_DAYS = 365;

/**
 * `days` consecutive days ending on (and including) `reference`.
 * Keys are `YYYY-MM-DD` local, matching every other mosaic surface.
 *
 * A given date always gets the same value regardless of `days`.
 */
export function buildDemoYear(
  reference: Date,
  days: number,
): Map<string, DayCategories> {
  if (days < 1 || days > CANONICAL_DAYS) {
    throw new RangeError(`days must be 1..${CANONICAL_DAYS}, got ${days}`);
  }

  const rand = mulberry32(SEED);
  const entries: [string, DayCategories][] = [];

  const lopsided = new Date(
    reference.getFullYear(),
    reference.getMonth() - LOPSIDED_MONTH_OFFSET,
    1,
  );

  for (let i = CANONICAL_DAYS - 1; i >= 0; i--) {
    const date = new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate() - i,
    );

    const isLopsided =
      date.getFullYear() === lopsided.getFullYear() &&
      date.getMonth() === lopsided.getMonth();

    // Draw all three every iteration regardless of branch, so the sequence
    // consumed per day is constant and the lopsided month cannot shift the
    // pattern of the months after it.
    const rolls = { mind: rand(), body: rand(), soul: rand() };

    entries.push([
      formatDateAsLocal(date),
      {
        mind: rolls.mind < BASE_RATE.mind,
        body: rolls.body < (isLopsided ? LOPSIDED_BODY_RATE : BASE_RATE.body),
        soul: rolls.soul < BASE_RATE.soul,
      },
    ]);
  }

  return new Map(entries.slice(CANONICAL_DAYS - days));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/landing-seed.test.ts`
Expected: PASS, 5 tests.

If the lopsided assertion fails, adjust `LOPSIDED_BODY_RATE` down (not the assertion) — the test encodes the design requirement.

- [ ] **Step 5: Commit**

```bash
git add src/lib/landing-seed.ts src/lib/landing-seed.test.ts
git commit -m "feat(landing): add deterministic demo year generator"
```

---

### Task 2: The toggle reducer

**Files:**
- Create: `src/lib/landing-interaction.ts`
- Test: `src/lib/landing-interaction.test.ts`

**Interfaces:**
- Consumes: `DayCategories`, `CategoryId` from `~/lib/types`.
- Produces:
  - `toggleCategory(map, key, category): Map<string, DayCategories>` — returns a **new** Map.
  - `becamePerfect(before, after, key): boolean` — drives the gold ring pulse.

- [ ] **Step 1: Write the failing test**

Create `src/lib/landing-interaction.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { becamePerfect, toggleCategory } from "./landing-interaction";
import type { DayCategories } from "./types";

const day = (mind: boolean, body: boolean, soul: boolean): DayCategories => ({
  mind,
  body,
  soul,
});

const mapOf = (d: DayCategories) => new Map([["2026-08-16", d]]);

describe("toggleCategory", () => {
  it("turns an unset category on", () => {
    const next = toggleCategory(mapOf(day(false, false, false)), "2026-08-16", "mind");
    expect(next.get("2026-08-16")).toEqual(day(true, false, false));
  });

  it("turns a set category off", () => {
    const next = toggleCategory(mapOf(day(true, false, false)), "2026-08-16", "mind");
    expect(next.get("2026-08-16")).toEqual(day(false, false, false));
  });

  it("does not mutate the input map", () => {
    const before = mapOf(day(false, false, false));
    toggleCategory(before, "2026-08-16", "mind");
    expect(before.get("2026-08-16")).toEqual(day(false, false, false));
  });

  it("treats an unknown key as an empty day rather than throwing", () => {
    const next = toggleCategory(new Map(), "2026-01-01", "soul");
    expect(next.get("2026-01-01")).toEqual(day(false, false, true));
  });
});

describe("becamePerfect", () => {
  it("is true only on the transition into perfect", () => {
    const before = mapOf(day(true, true, false));
    const after = toggleCategory(before, "2026-08-16", "soul");
    expect(becamePerfect(before, after, "2026-08-16")).toBe(true);
  });

  it("is false when leaving perfect", () => {
    const before = mapOf(day(true, true, true));
    const after = toggleCategory(before, "2026-08-16", "soul");
    expect(becamePerfect(before, after, "2026-08-16")).toBe(false);
  });

  it("is false when a non-completing category is added", () => {
    const before = mapOf(day(false, false, false));
    const after = toggleCategory(before, "2026-08-16", "mind");
    expect(becamePerfect(before, after, "2026-08-16")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/landing-interaction.test.ts`
Expected: FAIL — cannot resolve `./landing-interaction`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/landing-interaction.ts`:

```ts
// State transitions for the landing page's interactive mosaic. Pure and
// separate from the component so the behaviour is testable — vitest in this
// repo collects .ts only, so anything worth asserting must live here.

import { isPerfectDay } from "./mosaic";
import type { CategoryId, DayCategories } from "./types";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };

/** Flip one category on one day. Returns a new Map; never mutates. */
export function toggleCategory(
  map: Map<string, DayCategories>,
  key: string,
  category: CategoryId,
): Map<string, DayCategories> {
  const current = map.get(key) ?? EMPTY;
  const next = new Map(map);
  next.set(key, { ...current, [category]: !current[category] });
  return next;
}

/** True only on the transition INTO a perfect day — the gold ring pulse must
 *  not fire when a perfect day is being broken apart. */
export function becamePerfect(
  before: Map<string, DayCategories>,
  after: Map<string, DayCategories>,
  key: string,
): boolean {
  return (
    !isPerfectDay(before.get(key) ?? EMPTY) &&
    isPerfectDay(after.get(key) ?? EMPTY)
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/landing-interaction.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/landing-interaction.ts src/lib/landing-interaction.test.ts
git commit -m "feat(landing): add toggle reducer for the interactive mosaic"
```

---

### Task 3: The brand mark, wordmark, and the interpolation guard

**Files:**
- Create: `src/lib/brand.ts`, `src/lib/brand.test.ts`
- Create: `src/_components/landing/brand-mark.tsx`, `src/_components/landing/wordmark.tsx`
- Create: `src/_components/landing/no-interpolated-classes.test.ts`

**Interfaces:**
- Consumes: `tileBackground`, `tileBackgroundCompact` from `~/lib/mosaic`.
- Produces:
  - `markBackground(state: "resting" | "perfect"): string`
  - `MARK_RADIUS_RATIO = 0.28`
  - `<BrandMark size?: number, state?: "resting" | "perfect" />`
  - `<Wordmark className?: string />`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/brand.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MARK_RADIUS_RATIO, markBackground } from "./brand";
import { tileBackground, tileBackgroundCompact } from "./mosaic";

const PERFECT = { mind: true, body: true, soul: true };

describe("markBackground", () => {
  it("derives the resting mark from tileBackground, not a literal", () => {
    expect(markBackground("resting")).toBe(tileBackground(PERFECT));
  });

  it("renders three hard-stop bands on the 135deg axis", () => {
    expect(markBackground("resting")).toContain("135deg");
    expect(markBackground("resting")).toContain("var(--color-mind)");
    expect(markBackground("resting")).toContain("var(--color-body)");
    expect(markBackground("resting")).toContain("var(--color-soul)");
  });

  it("collapses the perfect state to the gold token", () => {
    expect(markBackground("perfect")).toBe(tileBackgroundCompact(PERFECT));
    expect(markBackground("perfect")).toBe("var(--color-perfect)");
  });
});

describe("MARK_RADIUS_RATIO", () => {
  it("is a squircle ratio that scales with the mark", () => {
    expect(MARK_RADIUS_RATIO).toBe(0.28);
    expect(32 * MARK_RADIUS_RATIO).toBeCloseTo(8.96);
  });
});
```

Create `src/_components/landing/no-interpolated-classes.test.ts`:

```ts
// Guards the failure that shipped in unified-demo.tsx: Tailwind scans source
// text for COMPLETE class names, so `from-${x}-50` generates nothing. It is not
// a type error, not a lint error, and the build succeeds — only a test catches
// it. See the landing uplift brief, finding B.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), "src/_components/landing");

/** Matches a `${...}` inside a className string or clsx-style template. */
const CLASSNAME_INTERPOLATION =
  /className\s*=\s*\{?\s*`[^`]*\$\{[^`]*`/s;

describe("landing components", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} builds no class names by interpolation`, () => {
      const source = readFileSync(join(DIR, file), "utf8");
      expect(CLASSNAME_INTERPOLATION.test(source)).toBe(false);
    });
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/brand.test.ts src/_components/landing/no-interpolated-classes.test.ts`
Expected: `brand.test.ts` FAILs (cannot resolve `./brand`). The guard test FAILs on
`unified-demo.tsx` — that failure is correct, and it is the real finding-B bug.

> Do **not** "fix" `unified-demo.tsx` to make this pass. Delete it, in Step 3.

- [ ] **Step 3: Delete the dead demo and its only caller**

The component has never rendered its category highlight (finding B) and advertises the product in
colours it does not use (finding C). It is being replaced wholesale, so it goes now rather than
leaving the guard test red across eight tasks.

```bash
git rm src/_components/landing/unified-demo.tsx
```

Then in `src/app/page.tsx`, delete the entire `<section id="inside">` block — from the
`{/* A look inside */}` comment through its closing `</section>` — and remove the now-unused
imports of `UnifiedDemo` and `Card`. Leave the rest of the almanac page alone; it is replaced in
Task 6.

Also remove the now-dangling `href="#inside"` "look inside" link in the CTA block (around
`page.tsx:220`), since its target no longer exists. Leave the `/signup` link above it untouched.

Verify nothing still references it:

```bash
grep -rn "unified-demo\|UnifiedDemo\|#inside" src/
```

Expected: **no output**.

Run: `pnpm check`
Expected: PASS — no unused-import errors.

- [ ] **Step 4: Write the implementation**

Create `src/lib/brand.ts`:

```ts
// The Northstar mark is not a drawing. A perfect day already renders as three
// hard-stop diagonal bands (see mosaic.ts), so the logo is emitted by the same
// function the product runs and cannot drift from the artifact.

import { tileBackground, tileBackgroundCompact } from "./mosaic";
import type { DayCategories } from "./types";

const PERFECT: DayCategories = { mind: true, body: true, soul: true };

/** Corner radius as a fraction of the mark's own width, so the squircle holds
 *  at favicon size. Deliberately larger than --radius-tile-week (12px); this is
 *  a mark-only value and must not become a radius token. */
export const MARK_RADIUS_RATIO = 0.28;

export type MarkState = "resting" | "perfect";

export function markBackground(state: MarkState): string {
  return state === "perfect"
    ? tileBackgroundCompact(PERFECT)
    : tileBackground(PERFECT);
}
```

Create `src/_components/landing/brand-mark.tsx`:

```tsx
import { MARK_RADIUS_RATIO, markBackground, type MarkState } from "~/lib/brand";

interface BrandMarkProps {
  /** px; the mark is square */
  size?: number;
  state?: MarkState;
}

export function BrandMark({ size = 28, state = "resting" }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * MARK_RADIUS_RATIO,
        background: markBackground(state),
      }}
    />
  );
}
```

Create `src/_components/landing/wordmark.tsx`:

```tsx
interface WordmarkProps {
  className?: string;
}

/**
 * Lowercase `northstar`, Plus Jakarta Sans at its heaviest, tightly tracked.
 * The `t` ascender is cut flat and shortened to x-height so it reads as a tile
 * edge rather than a stem — done by overlaying a canvas-coloured block on the
 * ascender, which keeps the word selectable and screen-reader-legible.
 */
export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={`relative text-[19px] leading-none font-extrabold tracking-[-0.03em] text-[var(--color-ink)] ${className}`}
    >
      northstar
      <span
        aria-hidden
        className="absolute top-0 left-[3.62em] h-[0.22em] w-[0.09em] bg-[var(--color-canvas)]"
      />
    </span>
  );
}
```

> The overlay offset is tuned against Plus Jakarta Sans ExtraBold at
> `tracking-[-0.03em]`. If the weight or tracking changes, re-check it visually
> at 19px and at 40px — it is an em-relative value, so it scales, but it is
> position-sensitive to tracking.

- [ ] **Step 5: Run the whole suite**

Run: `pnpm vitest run`
Expected: **everything PASSES**, including the guard test across `brand-mark.tsx`,
`wordmark.tsx` and `landing-footer.tsx`.

From this task onward the suite must stay green. A red suite in any later task is a real
regression, not an expected failure.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(brand): derive the mark from tileBackground, delete the dead demo"
```

---

### Task 4: Fraunces, wash tokens, and the nav

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/globals.css`
- Create: `src/_components/landing/landing-nav.tsx`

**Interfaces:**
- Produces: CSS vars `--font-display`, `--color-wash-from`, `--color-wash-to`; utility class `.font-display`; `<LandingNav />`.

- [ ] **Step 1: Wire Fraunces**

Modify `src/app/layout.tsx`. Add the import and the font instance beside the existing `jakarta`:

```ts
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // REQUIRED. Omitting `axes` silently loads the default instance with no
  // wonk — the font arrives, the character does not, and nothing errors.
  axes: ["SOFT", "WONK", "opsz"],
});
```

Then add it to the `<html>` className:

```tsx
<html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${fraunces.variable}`}>
```

> Fraunces is declared at the root so the variable exists, but only the landing
> route applies `.font-display`. Next tree-shakes unused font CSS per route, so
> `/home` does not download it.

- [ ] **Step 2: Ship the mark as the favicon**

Create `src/app/icon.svg` — the mark in literal light-theme hexes, since a
favicon has no access to CSS custom properties. The three stops are doubled at
33.333% and 66.667% to produce hard bands, matching `tileBackground`'s hard
stops. The gradient runs `(0,0) → (1,1)`, which is the SVG equivalent of CSS
`135deg`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6c5ce7" />
      <stop offset="33.333%" stop-color="#6c5ce7" />
      <stop offset="33.333%" stop-color="#f2542d" />
      <stop offset="66.667%" stop-color="#f2542d" />
      <stop offset="66.667%" stop-color="#0fa47f" />
      <stop offset="100%" stop-color="#0fa47f" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="9" fill="url(#m)" />
</svg>
```

`rx="9"` is `32 × MARK_RADIUS_RATIO`, rounded.

Then **remove the `icons` line from `metadata` in `src/app/layout.tsx`**:

```ts
export const metadata: Metadata = {
  title: "northstar",
  description: "habit tracker for the locked in",
};
```

An explicit `metadata.icons` **overrides** the file-based `app/icon.svg`
convention. Leave it in place and the new mark silently never appears — the old
`/northstar-logo.png` keeps winning.

- [ ] **Step 3: Add wash tokens, the display utility, and the reveal**

In `src/styles/globals.css`, inside the existing `@theme` block, after the Motion group:

```css
  /* Landing wash — marketing surface only. Not an app token. */
  --color-wash-from: #d9d2f7;
  --color-wash-to: #f4f3f8;
```

In the existing `.dark` block, after `--color-perfect`:

```css
  /* Independently tuned, not an inversion — a deep aubergine that keeps the
     violet family without lifting the page off the near-black canvas. */
  --color-wash-from: #2a2440;
  --color-wash-to: #131219;
```

Then, after the existing `.animate-rise-in` rule:

```css
.font-display {
  font-family: var(--font-display), ui-serif, Georgia, serif;
  font-variation-settings:
    "opsz" 144,
    "WONK" 1,
    "SOFT" 35;
}

/* Section reveal. Sections start hidden and are revealed by adding
   .is-revealed via IntersectionObserver. */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.reveal.is-revealed {
  opacity: 1;
  transform: none;
}
```

And inside the existing `@media (prefers-reduced-motion: reduce)` block:

```css
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
```

> The reduced-motion rule must make `.reveal` visible **unconditionally**, not
> just fast. If the IntersectionObserver never runs — JS disabled, hydration
> error, observer unsupported — an opacity-0 section is invisible content. This
> rule is also the no-JS safety net.

- [ ] **Step 4: Build the nav**

Create `src/_components/landing/landing-nav.tsx`:

```tsx
import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { Wordmark } from "./wordmark";

export function LandingNav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Northstar home">
        <BrandMark size={26} />
        <Wordmark />
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/signin"
          className="rounded-full bg-[var(--color-sunken)] px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-hairline)]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13px] font-semibold text-[var(--color-canvas)] hover:opacity-90"
        >
          Start tracking
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm check`
Expected: PASS — including `Palette check passed.` No category hues changed.

Run: `pnpm vitest run src/_components/landing/no-interpolated-classes.test.ts`
Expected: PASS — `landing-nav.tsx` included. The suite has been green since Task 3; a failure here is a real regression.

Run `pnpm dev` and confirm the browser tab shows the three-band mark, not the
old logo. A stale favicon is usually browser cache — hard-reload before
concluding it is broken.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/icon.svg src/styles/globals.css src/_components/landing/landing-nav.tsx
git commit -m "feat(brand): add Fraunces display face, wash tokens, favicon, and nav"
```

---

### Task 5: The interactive mosaic

The centrepiece. The only client component on the page.

**Files:**
- Create: `src/_components/landing/interactive-year.tsx`

**Interfaces:**
- Consumes: `buildDemoYear`, `HERO_WEEKS`, `HERO_DAYS`; `toggleCategory`, `becamePerfect`; `MosaicTile` from `~/_components/ui/mosaic`; `SegmentedControl` from `~/_components/ui/primitives`; `dayLabel`, `tileBackground` from `~/lib/mosaic`; `formatDateAsLocal` from `~/lib/utils`; `CATEGORY_LABELS` from `~/lib/constants`.
- Produces: `<InteractiveYear referenceDate: Date />`

**Two things that will be got wrong if not stated explicitly:**

1. **`MosaicTile` is not a button.** It renders a `motion.div` and, when
   `focusable`, sets `role="img"` plus its own `tabIndex` and `aria-label`
   (`mosaic-tile.tsx:44-47`). Pass **`focusable={false}`** and wrap it in a real
   `<button>`. Setting `focusable` and wrapping would produce a nested tab stop
   and a `role="img"` announced inside a button.
2. **Roving tabindex.** 140 tiles must be one tab stop. Exactly one button
   carries `tabIndex={0}`; the rest are `-1`, and arrow keys move focus.

- [ ] **Step 1: Write the component**

Create `src/_components/landing/interactive-year.tsx`:

```tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { MosaicTile } from "~/_components/ui/mosaic";
import { SegmentedControl } from "~/_components/ui/primitives";
import { CATEGORY_LABELS } from "~/lib/constants";
import {
  becamePerfect,
  toggleCategory,
} from "~/lib/landing-interaction";
import { buildDemoYear, HERO_DAYS, HERO_WEEKS } from "~/lib/landing-seed";
import { dayLabel, tileBackground } from "~/lib/mosaic";
import type { CategoryId, DayCategories } from "~/lib/types";
import { formatDateAsLocal } from "~/lib/utils";

const TILE = 18;
const GAP = 4;
const ROWS = 7;

const OPTIONS: { id: CategoryId; label: string }[] = [
  { id: "mind", label: CATEGORY_LABELS.mind },
  { id: "body", label: CATEGORY_LABELS.body },
  { id: "soul", label: CATEGORY_LABELS.soul },
];

interface InteractiveYearProps {
  /** Passed in from the server so the grid shape is identical on both sides of
   *  hydration. Never call new Date() in here. */
  referenceDate: Date;
}

export function InteractiveYear({ referenceDate }: InteractiveYearProps) {
  const [category, setCategory] = useState<CategoryId>("mind");
  const [days, setDays] = useState<Map<string, DayCategories>>(() =>
    buildDemoYear(referenceDate, HERO_DAYS),
  );
  const [pulseKey, setPulseKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Column-major: index i is week floor(i / 7), weekday i % 7. Oldest first,
  // so the last column is the reference date's week.
  const dates = useMemo(() => {
    const out: Date[] = [];
    for (let i = HERO_DAYS - 1; i >= 0; i--) {
      out.push(
        new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth(),
          referenceDate.getDate() - i,
        ),
      );
    }
    return out;
  }, [referenceDate]);

  // Computed outside a state updater deliberately. Updater functions must be
  // pure — React runs them twice in StrictMode, so calling setPulseKey and
  // setAnnouncement inside one would double-fire the live region.
  const handleToggle = useCallback(
    (key: string, date: Date) => {
      const after = toggleCategory(days, key, category);
      setPulseKey(becamePerfect(days, after, key) ? key : null);
      setAnnouncement(dayLabel(date, after.get(key)!));
      setDays(after);
    },
    [days, category],
  );

  const moveFocus = useCallback((from: number, delta: number) => {
    const next = Math.min(Math.max(from + delta, 0), HERO_DAYS - 1);
    setFocusIndex(next);
    const el = gridRef.current?.querySelectorAll("button")[next];
    (el as HTMLButtonElement | undefined)?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const map: Record<string, number> = {
        ArrowUp: -1,
        ArrowDown: 1,
        ArrowLeft: -ROWS,
        ArrowRight: ROWS,
      };
      const delta = map[e.key];
      if (delta === undefined) return;
      e.preventDefault();
      moveFocus(index, delta);
    },
    [moveFocus],
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <SegmentedControl options={OPTIONS} value={category} onChange={setCategory} />

      <div
        ref={gridRef}
        className="grid grid-flow-col overflow-x-auto"
        style={{
          gridTemplateRows: `repeat(${ROWS}, ${TILE}px)`,
          gridTemplateColumns: `repeat(${HERO_WEEKS}, ${TILE}px)`,
          gap: GAP,
        }}
      >
        {dates.map((date, index) => {
          const key = formatDateAsLocal(date);
          const value = days.get(key) ?? { mind: false, body: false, soul: false };
          return (
            <button
              key={key}
              type="button"
              aria-pressed={value[category]}
              aria-label={dayLabel(date, value)}
              tabIndex={index === focusIndex ? 0 : -1}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onClick={() => handleToggle(key, date)}
              className="rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              <MosaicTile
                categories={value}
                background={tileBackground(value)}
                size={TILE}
                radius="var(--radius-tile-month)"
                pulse={pulseKey === key}
                focusable={false}
              />
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-[var(--color-ink-muted)]">
        Pick a category, then click a day. Three in one day turns it gold.
      </p>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
```

> `sr-only` is not defined in this codebase's CSS. Add it to `globals.css` in
> this task, after `.tabular`:
>
> ```css
> .sr-only {
>   position: absolute;
>   width: 1px;
>   height: 1px;
>   padding: 0;
>   margin: -1px;
>   overflow: hidden;
>   clip: rect(0, 0, 0, 0);
>   white-space: nowrap;
>   border-width: 0;
> }
> ```

- [ ] **Step 2: Verify types and lint**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 3: Verify the guard test**

Run: `pnpm vitest run src/_components/landing/no-interpolated-classes.test.ts`
Expected: `interactive-year.tsx` passes.

- [ ] **Step 4: Commit**

```bash
git add src/_components/landing/interactive-year.tsx src/styles/globals.css
git commit -m "feat(landing): add the interactive mosaic hero"
```

---

### Task 6: The hero, and first page assembly

**Files:**
- Create: `src/_components/landing/hero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `LandingNav`, `InteractiveYear`.
- Produces: `<Hero referenceDate: Date />`

- [ ] **Step 1: Write the hero**

Create `src/_components/landing/hero.tsx`:

```tsx
import { InteractiveYear } from "./interactive-year";

interface HeroProps {
  referenceDate: Date;
}

export function Hero({ referenceDate }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-wash-from)] to-[var(--color-wash-to)] px-6 pt-10 pb-28">
      {/* Grain. Pure CSS, no asset — carried over from the previous design. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1
          className="animate-rise-in font-display text-[clamp(40px,6vw,64px)] leading-[1.05] font-normal tracking-[-0.02em] text-[var(--color-ink)]"
          style={{ textWrap: "balance" }}
        >
          Your year, in three colours.
        </h1>
        <p
          className="animate-rise-in mx-auto mt-5 max-w-xl text-[16px] leading-[1.6] text-[var(--color-ink-muted)]"
          style={{ animationDelay: "120ms", animationFillMode: "both", textWrap: "balance" }}
        >
          Mind, body, soul &mdash; one square a day. See which part of your life
          you&rsquo;re actually showing up for.
        </p>
      </div>

      <div
        className="animate-rise-in relative mx-auto mt-14 max-w-4xl"
        style={{ animationDelay: "240ms", animationFillMode: "both" }}
      >
        <div className="rounded-[28px] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lift)] sm:p-8">
          <InteractiveYear referenceDate={referenceDate} />
        </div>
      </div>
    </section>
  );
}
```

> The hero surface is deliberately **not** the `Card` primitive: it needs a
> 28px radius and `--shadow-lift`, and growing `Card` props to get there is
> exactly what the design brief forbids.

- [ ] **Step 2: Assemble the page so far**

Replace the whole of `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { Hero } from "~/_components/landing/hero";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { LandingNav } from "~/_components/landing/landing-nav";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  // Resolved once on the server and passed down, so the mosaic grid has the
  // same shape on both sides of hydration.
  const referenceDate = new Date();

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] selection:bg-[var(--color-mind)]/20">
      <LandingNav />
      <Hero referenceDate={referenceDate} />
      <LandingFooter />
    </div>
  );
}
```

> This drops the roman-numeral helper, the `Rule`/`Stagger` components, the
> epigraph and the table of contents in one edit. `UnifiedDemo` and its
> `Card` wrapper were already removed in Task 3.

- [ ] **Step 3: Verify it builds and runs**

Run: `pnpm check && pnpm build`
Expected: both PASS.

Run: `pnpm dev`, open `http://localhost:3000` while signed out. Confirm: headline in Fraunces with a visibly splayed *y*; the mosaic renders; clicking a tile fills it in the selected category; three categories on one day shows gold with a ring.

Then check the browser console for a hydration warning. There must be none — if one appears, `referenceDate` is being recomputed somewhere client-side.

- [ ] **Step 4: Commit**

```bash
git add src/_components/landing/hero.tsx src/app/page.tsx
git commit -m "feat(landing): lead with the interactive mosaic, retire the almanac"
```

---

### Task 7: The GitHub comparison

**Files:**
- Create: `src/_components/landing/comparison.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `buildDemoYear`, `MosaicTile`, `activeCategories`, `tileBackgroundCompact`.
- Produces: `<Comparison referenceDate: Date />`

- [ ] **Step 1: Write the component**

Create `src/_components/landing/comparison.tsx`:

```tsx
import { MosaicTile } from "~/_components/ui/mosaic";
import { buildDemoYear } from "~/lib/landing-seed";
import { activeCategories, tileBackgroundCompact } from "~/lib/mosaic";
import type { DayCategories } from "~/lib/types";

const TILE = 9;
const GAP = 3;
const DAYS = 182; // 26 weeks — a legible half-year at 9px
const ROWS = 7;

/** GitHub's contribution greens. Deliberately literal and deliberately NOT a
 *  token: this depicts a different product, and must never become part of
 *  Northstar's palette. */
const CONTRIB_GREENS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] as const;

function greenFor(day: DayCategories): string {
  return CONTRIB_GREENS[activeCategories(day).length]!;
}

export function Comparison({ referenceDate }: { referenceDate: Date }) {
  const days = [...buildDemoYear(referenceDate, DAYS).values()];

  const grid = {
    gridTemplateRows: `repeat(${ROWS}, ${TILE}px)`,
    gap: GAP,
  } as const;

  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display max-w-2xl text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
          A contribution graph tells you that you were busy.
        </h2>
        <p className="mt-4 max-w-xl text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
          The same six months, twice. One of them tells you what you were busy
          with.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <figure>
            <figcaption className="mb-3 text-[13px] font-semibold text-[var(--color-ink-muted)]">
              One colour &mdash; did you show up?
            </figcaption>
            <div className="grid grid-flow-col overflow-x-auto" style={grid}>
              {days.map((day, i) => (
                <div
                  key={i}
                  style={{
                    width: TILE,
                    height: TILE,
                    borderRadius: 2,
                    background: greenFor(day),
                  }}
                />
              ))}
            </div>
          </figure>

          <figure>
            <figcaption className="mb-3 text-[13px] font-semibold text-[var(--color-ink)]">
              Three colours &mdash; which part of you showed up?
            </figcaption>
            <div className="grid grid-flow-col overflow-x-auto" style={grid}>
              {days.map((day, i) => (
                <MosaicTile
                  key={i}
                  categories={day}
                  background={tileBackgroundCompact(day)}
                  size={TILE}
                  radius={2}
                />
              ))}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
```

> Both figures carry text captions. The argument is made in colour, so it must
> not rest on colour alone.

- [ ] **Step 2: Wire it in**

In `src/app/page.tsx`, import `Comparison` and place it between `<Hero />` and `<LandingFooter />`:

```tsx
<Comparison referenceDate={referenceDate} />
```

- [ ] **Step 3: Verify**

Run: `pnpm check && pnpm vitest run`
Expected: PASS, whole suite.

- [ ] **Step 4: Commit**

```bash
git add src/_components/landing/comparison.tsx src/app/page.tsx
git commit -m "feat(landing): show why three colours beat one"
```

---

### Task 8: The lopsided month

**Files:**
- Create: `src/_components/landing/lopsided-month.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `buildDemoYear`, `LOPSIDED_MONTH_OFFSET`, `MosaicTile`, `tileBackground`, `formatDateAsLocal`, `Pill`.
- Produces: `<LopsidedMonth referenceDate: Date />`

- [ ] **Step 1: Write the component**

Create `src/_components/landing/lopsided-month.tsx`:

```tsx
import { MosaicTile } from "~/_components/ui/mosaic";
import { Pill } from "~/_components/ui/primitives";
import { buildDemoYear, LOPSIDED_MONTH_OFFSET } from "~/lib/landing-seed";
import { tileBackground } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";

const TILE = 34;
const GAP = 6;

export function LopsidedMonth({ referenceDate }: { referenceDate: Date }) {
  const all = buildDemoYear(referenceDate, 365);

  const first = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - LOPSIDED_MONTH_OFFSET,
    1,
  );
  const monthName = first.toLocaleDateString("en-US", { month: "long" });
  const daysInMonth = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(first.getFullYear(), first.getMonth(), i + 1);
    const key = formatDateAsLocal(date);
    return { key, value: all.get(key) ?? { mind: false, body: false, soul: false } };
  });

  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
            You can see the month you stopped moving.
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
            {monthName} was a reading month. Barely any coral &mdash; the body
            squares are mostly empty, and you can tell at a glance rather than
            from a number.
          </p>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
            Nothing here scolds you for it. It just shows you, so you can decide
            what next month looks like.
          </p>
          <div className="mt-6 flex gap-2">
            <Pill category="mind" />
            <Pill category="body" />
            <Pill category="soul" />
          </div>
        </div>

        <div
          className="grid grid-cols-7 justify-center justify-items-center"
          style={{ gap: GAP }}
          role="img"
          aria-label={`${monthName}: mind and soul kept on most days, body kept on very few`}
        >
          {cells.map(({ key, value }) => (
            <MosaicTile
              key={key}
              categories={value}
              background={tileBackground(value)}
              size={TILE}
              radius="var(--radius-tile-month)"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

> The grid carries a single `role="img"` with a summary label rather than 30
> individually announced tiles. This block is decorative evidence for the
> adjacent prose, not something to navigate.

- [ ] **Step 2: Wire it in**

Add `<LopsidedMonth referenceDate={referenceDate} />` after `<Comparison />` in `src/app/page.tsx`.

- [ ] **Step 3: Verify**

Run: `pnpm check && pnpm build`
Expected: PASS. Then in `pnpm dev`, confirm the month is visibly short of coral. If it is not, Task 1's `LOPSIDED_BODY_RATE` needs lowering — and its test should already have caught it.

- [ ] **Step 4: Commit**

```bash
git add src/_components/landing/lopsided-month.tsx src/app/page.tsx
git commit -m "feat(landing): show a lopsided month"
```

---

### Task 9: Categories and CTA

**Files:**
- Create: `src/_components/landing/categories.tsx`, `src/_components/landing/landing-cta.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `CATEGORY_IDS`, `CATEGORY_LABELS`, `CATEGORY_DESCRIPTIONS` from `~/lib/constants`.
- Produces: `<Categories />`, `<LandingCta />`

- [ ] **Step 1: Write the components**

Create `src/_components/landing/categories.tsx`:

```tsx
import { CATEGORY_DESCRIPTIONS, CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";

export function Categories() {
  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
          Three parts of a life.
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {CATEGORY_IDS.map((id) => (
            <div
              key={id}
              className="rounded-[22px] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6"
            >
              <span
                aria-hidden
                className="inline-block h-9 w-9 rounded-full"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-${id}) 18%, transparent)`,
                }}
              />
              <h3
                className="mt-4 text-[18px] font-bold"
                style={{ color: `var(--color-${id}-ink)` }}
              >
                {CATEGORY_LABELS[id]}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-ink-muted)]">
                {CATEGORY_DESCRIPTIONS[id]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

> The `color-mix` and `var(--color-${id})` values are **inline styles**, not
> class names. Tailwind never sees them, so interpolation is safe here — and
> the guard test only inspects `className`.

Create `src/_components/landing/landing-cta.tsx`:

```tsx
import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function LandingCta() {
  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-28 text-center">
      <BrandMark size={40} state="perfect" />
      <h2 className="font-display mx-auto mt-6 max-w-2xl text-[clamp(30px,4.5vw,48px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
        Start with today.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
        Some days you&rsquo;ll only get one square. That still counts.
      </p>
      <Link
        href="/signup"
        className="mt-8 inline-block rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-canvas)] hover:opacity-90"
      >
        Start tracking
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Wire both in**

Add `<Categories />` then `<LandingCta />` after `<LopsidedMonth />` in `src/app/page.tsx`.

- [ ] **Step 3: Verify**

Run: `pnpm check && pnpm vitest run`
Expected: PASS, whole suite.

- [ ] **Step 4: Commit**

```bash
git add src/_components/landing/categories.tsx src/_components/landing/landing-cta.tsx src/app/page.tsx
git commit -m "feat(landing): add category cards and closing CTA"
```

---

### Task 10: Rebuild the footer on tokens

The current footer is not merely off-palette — it is a **second closing CTA**. It carries a
`text-5xl` tagline ("Habits that set you up for success."), a `bg-blue-600` Get Started button and
a Log In link. Task 9's `LandingCta` now does that job, immediately above it. Re-skinning both
would leave the page ending with two consecutive calls to action.

It also carries the same rogue vocabulary as the deleted demo — `from-blue-500 via-red-500
to-purple-500` on the logo tile and again on the gradient-text word — advertising the product in
colours the product does not use (finding C).

So the footer **shrinks to a bottom bar**. The tagline and duplicate CTA are deleted, not
recoloured.

**Files:**
- Modify: `src/_components/landing/landing-footer.tsx`

- [ ] **Step 1: Replace the file entirely**

```tsx
import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { Wordmark } from "./wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-hairline)] px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <BrandMark size={22} />
          <Wordmark className="text-[16px]" />
        </div>

        <nav className="flex items-center gap-5 text-[14px] text-[var(--color-ink-muted)]">
          <Link href="/signin" className="hover:text-[var(--color-ink)]">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-[var(--color-ink)]">
            Sign up
          </Link>
        </nav>

        <p className="text-[13px] text-[var(--color-ink-faint)]">
          © 2026 Northstar. Built for consistency.
        </p>
      </div>
    </footer>
  );
}
```

Notes on what this deliberately drops:

- **`"use client"` and framer-motion.** The footer's only client-side behaviour was
  `whileInView` entrance animation. Section reveals are now handled by `RevealOnScroll` (Task 11),
  so the footer becomes a server component and stops shipping JS.
- **`next/image` and `/northstar-logo.png`.** Replaced by `BrandMark`. Leave the PNG in `public/`
  — it is still referenced elsewhere until separately audited.
- **The tagline and the CTA pair.** Now redundant with `LandingCta`.
- Both links are preserved, so no navigation path is lost.

- [ ] **Step 2: Verify no literals remain**

Run: `grep -nE "zinc|blue-|red-|purple-|bg-white|bg-black|text-white|text-black" src/_components/landing/landing-footer.tsx`
Expected: **no output**.

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 3: Verify both themes**

In `pnpm dev`, toggle the theme and confirm the footer text is legible in dark mode. The repo has shipped an invisible dark-mode control before (commit `c295630`), so check it rather than assuming.

- [ ] **Step 4: Commit**

```bash
git add src/_components/landing/landing-footer.tsx
git commit -m "fix(landing): rebuild the footer on design tokens"
```

---

### Task 11: Delete the demo, add section reveals, verify

**Files:**
- Delete: `src/_components/landing/unified-demo.tsx`
- Create: `src/_components/landing/reveal-on-scroll.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Delete the dead demo**

```bash
git rm src/_components/landing/unified-demo.tsx
```

Run: `grep -rn "unified-demo\|UnifiedDemo" src/`
Expected: **no output**. If anything remains, remove the reference.

- [ ] **Step 2: Verify the guard test now passes cleanly**

Run: `pnpm vitest run`
Expected: **all** tests PASS, including every file in the interpolation guard. This is the first point at which the suite is fully green.

- [ ] **Step 3: Add the reveal observer**

Create `src/_components/landing/reveal-on-scroll.tsx`:

```tsx
"use client";

import { useEffect } from "react";

/**
 * Adds `.is-revealed` to every `.reveal` as it enters view, once.
 *
 * The CSS in globals.css makes `.reveal` unconditionally visible under
 * prefers-reduced-motion, so this component is a progressive enhancement — if
 * it never runs, no content is hidden.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      nodes.forEach((n) => n.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return null;
}
```

Add `<RevealOnScroll />` as the last child inside the wrapper `<div>` in `src/app/page.tsx`.

- [ ] **Step 4: Full verification**

Run each and confirm the output:

```bash
pnpm check    # lint + tsc + "Palette check passed."
pnpm test     # all green
pnpm build    # succeeds
```

Then in `pnpm dev`, signed out, confirm all of:

- [ ] Headline renders in Fraunces with a visibly splayed *y* descender (if it looks like a plain serif, `axes` is missing from `layout.tsx`)
- [ ] Clicking tiles fills them in the selected category; a third category turns the day gold with a ring pulse
- [ ] Tab reaches the mosaic **once**, then arrow keys move between tiles
- [ ] A screen reader announces each day on toggle
- [ ] With OS "reduce motion" on: no reveal animation, no pulse, **but tile colour still changes instantly on click**
- [ ] Dark mode: wash is aubergine, footer legible, focus rings visible
- [ ] No hydration warning in the console
- [ ] Signed in, `/` still redirects to `/home`
- [ ] `/signup` still reachable from both CTAs

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(landing): delete the dead demo, add scroll reveals"
```

---

## Post-implementation

Deferred, recorded so it is not lost: `MosaicYear` calls `new Date()` inside `useMemo`
(`mosaic-year.tsx:31`) while being server-rendered, so it can produce a different grid shape on
server and client across a timezone or midnight boundary. The landing page sidesteps this with an
explicit `referenceDate`. The app-side issue is untouched and still open.
