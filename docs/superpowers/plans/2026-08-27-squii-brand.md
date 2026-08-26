# Squii Brand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename Northstar to Squii across every user-facing surface, replace the three-band tile mark with a squid mascot, and recompose the auth pages so the brand survives the door it exists to get people through.

**Architecture:** Squii is one SVG component with an `expression` prop and size-derived detail tiers — never four files, so the mark cannot drift between moods. Colour constants and the expression/tier mapping live in `src/lib/` and are unit-tested; the drawing is not. The category palette stays frozen; Squii's colours join as brand tokens and are gated against it.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v4 (CSS-first `@theme`), framer-motion 12, Vitest 3, `next/font/google`.

## Global Constraints

- **Vitest collects `src/**/*.test.ts` only** (`vitest.config.ts:9`) — `.ts`, NOT `.tsx`, `environment: "node"`, no React testing library. Do not write component tests; they will not run.
- **Category hexes are frozen**: mind `#6c5ce7`, body `#f2542d`, soul `#0fa47f`, perfect `#d4a017` (light) / `#ffce54` (dark). Squii's colours are BRAND tokens and must never encode data in the mosaic.
- **Never build Tailwind class names by string interpolation.** `src/_components/landing/no-interpolated-classes.test.ts` enforces it and exports `hasInterpolatedClassName(source)`. It flags `-${` or `}-` inside className-context template literals; interpolation into inline `style` values is fine and excluded.
- **Squii moves only in response to a user action.** No idle animation, no attract loop, no timer-driven motion. He has **no sad face** and must never animate on failure.
- **Every animation needs a `prefers-reduced-motion` path** that keeps the feedback and drops the performance.
- **Rename scope is user-facing only.** Do NOT touch `package.json`'s name, the repo directory, DB tables, or component filenames.
- Package manager is **pnpm**. `pnpm check` (lint + tsc + palette), `pnpm test`, `pnpm build`.

---

## Verified geometry — use these values verbatim

The glyph below was authored, rendered in a browser at 150/64/32/20/16px on both lavender and white, and visually confirmed. **Do not redraw it.** viewBox is `0 0 64 64` at every size.

```
FINS (drawn FIRST, behind the mantle — this flare is what makes him a squid and not a ghost):
  <ellipse cx="14.5" cy="27" rx="8.5" ry="5.2" transform="rotate(-27 14.5 27)"/>
  <ellipse cx="49.5" cy="27" rx="8.5" ry="5.2" transform="rotate(27 49.5 27)"/>

MANTLE + ARMS (one closed path; 5 arms of equal 6-unit width at x = 17,23,29,35,41,47):
  M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44
  Q20 52.5 23 44 Q26 52.5 29 44 Q32 52.5 35 44 Q38 52.5 41 44 Q44 52.5 47 44
  C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z

MANTLE ONLY (small tier — arms removed, hem closed flat):
  M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44 L47 44
  C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z

EYES OPEN:
  <ellipse cx="24.5" cy="32" rx="4.4" ry="5.4"/>
  <ellipse cx="39.5" cy="32" rx="4.4" ry="5.4"/>

EYES CLOSED (the `shy` expression — happy arcs, NOT arms over the face):
  <path d="M19 30 q5.5 -4 11 0" fill="none" stroke-width="2" stroke-linecap="round"/>
  <path d="M34 30 q5.5 -4 11 0" fill="none" stroke-width="2" stroke-linecap="round"/>

SMILE (present in every expression):
  <path d="M29.4 38.4 q2.6 3.2 5.2 0" fill="none" stroke-width="2" stroke-linecap="round"/>
```

**Detail tiers, derived from `size`:**

| size | fins | mantle | arms | eyes | smile |
|---|---|---|---|---|---|
| ≥ 32px | yes | full path | yes | yes | yes |
| 20–31px | yes | full path | yes | yes | yes |
| ≤ 19px | yes | mantle-only path | **no** | yes | **no** |

At 16px the arms merge into a muddy fringe while the fin flare and eyes stay legible — verified in a browser. The small tier is a legibility requirement, not tidiness.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/squii.ts` | Colour constants, `MarkTier`, `tierForSize()`, `SquiiExpression`. Pure. |
| `src/lib/squii.test.ts` | Tier boundaries, expression set, colour constants. |
| `src/_components/brand/squii.tsx` | The glyph. One SVG, all expressions and tiers. |
| `src/_components/brand/wordmark.tsx` | `squii` lockup, monoline geometric SVG. |
| `src/_components/brand/no-interpolated-classes.test.ts` | Guard, reusing the landing detector. |
| `src/lib/rename.test.ts` | Fails if a user-facing "northstar" string survives. |
| `src/app/icon.svg` | Squii at the small tier, literal hexes. |
| `src/lib/brand.ts` | **Deleted** — the tile mark retires. |
| `src/_components/landing/brand-mark.tsx` | **Deleted.** |
| `src/_components/landing/wordmark.tsx` | **Deleted** (replaced by the brand/ one). |
| `src/lib/brand.test.ts` | Rewritten as the favicon guard against Squii's hexes. |
| `src/styles/globals.css` | Squii tokens, `--ease-squish`, wash retirement. |
| `src/app/layout.tsx` | `SOFT` 35 → 60; metadata title/description. |
| `src/app/signin/page.tsx`, `src/app/signup/page.tsx` | Recomposed. |

---

### Task 1: Squii's colours, tiers, and the palette gate

**Files:**
- Create: `src/lib/squii.ts`, `src/lib/squii.test.ts`
- Modify: `scripts/check-palette.ts`

**Interfaces:**
- Produces: `SQUII` (colour constants), `type SquiiExpression = "resting" | "shy" | "gold" | "wave"`, `type MarkTier = "full" | "small"`, `tierForSize(size: number): MarkTier`

- [ ] **Step 1: Write the failing test**

Create `src/lib/squii.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SQUII, tierForSize } from "./squii";
import { CATEGORY_HEX_LIGHT } from "./constants";

describe("SQUII colours", () => {
  it("pins the measured brand values", () => {
    expect(SQUII.body).toBe("#fdb6c0");
    expect(SQUII.ink).toBe("#31356b");
    expect(SQUII.ground).toBe("#be9fe0");
    expect(SQUII.gold).toBe("#d4a017");
  });

  it("uses no category hue as its body", () => {
    const cats = Object.values(CATEGORY_HEX_LIGHT);
    expect(cats).not.toContain(SQUII.body);
  });
});

describe("tierForSize", () => {
  it("drops detail at and below 19px", () => {
    expect(tierForSize(19)).toBe("small");
    expect(tierForSize(16)).toBe("small");
  });

  it("keeps full detail from 20px up", () => {
    expect(tierForSize(20)).toBe("full");
    expect(tierForSize(32)).toBe("full");
    expect(tierForSize(150)).toBe("full");
  });

  it("has no gap or overlap at the boundary", () => {
    expect(tierForSize(19)).not.toBe(tierForSize(20));
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/lib/squii.test.ts`
Expected: FAIL — cannot resolve `./squii`.

- [ ] **Step 3: Implement**

Create `src/lib/squii.ts`:

```ts
// Squii's brand colours. These are BRAND values: they identify the product.
// They must never be used to encode a category in the mosaic, where colour
// carries meaning — see scripts/check-palette.ts for the enforced separation.

export const SQUII = {
  /** The body. Sampled from public/squid.png (mid-tone; the render is shaded
   *  from #febfcb lit to #fdacba shadowed). dE 62.6 from body coral, well clear
   *  of the gate's 40 floor. */
  body: "#fdb6c0",
  /** Eyes, and available as a display ink. The render's eyes sample at #444273,
   *  which measures only 4.06:1 on the ground and so cannot be used as text.
   *  Deepened to #31356b (4.98:1 on ground, 9.24 -> 11.34:1 on white) so ONE
   *  token serves both the eyes and any text use. Visually near-identical at
   *  eye size. */
  ink: "#31356b",
  /** His lavender ground, sampled from public/squid.png.
   *  MUST match the PNG exactly: the file is RGB with NO alpha channel, so the
   *  lavender is baked in. Any mismatch renders the hero as a visible square. */
  ground: "#be9fe0",
  /** Perfect-day state. Deliberately the existing gold token's light value, so
   *  a gold Squii and a gold tile are the same colour rather than two golds. */
  gold: "#d4a017",
} as const;

export type SquiiExpression = "resting" | "shy" | "gold" | "wave";

/** Detail level. Below 20px the arms merge into a muddy fringe while the fin
 *  flare and eyes stay legible — verified in a browser at 16px on both light
 *  and lavender grounds. This is a legibility rule, not a tidiness one. */
export type MarkTier = "full" | "small";

export function tierForSize(size: number): MarkTier {
  return size <= 19 ? "small" : "full";
}
```

- [ ] **Step 4: Extend the palette gate**

In `scripts/check-palette.ts`, add to the `THEMES` map for **both** themes:

```ts
    squii: "#fdb6c0",
    squiiInk: "#31356b",
    squiiGround: "#be9fe0",
```

Then, inside the existing per-theme loop, after the `perfect` checks, add:

```ts
  // Squii is the mascot, not a category. He sits in the same warm family as
  // body coral, so if he drifts toward it users start reading the brand colour
  // as data. Gated at the same dE floor as the categories themselves.
  //
  // The danger is the neighbour, not the value: a richer rose #f2857f measures
  // 37.9 against body and FAILS. Do not "enrich" Squii without re-running this.
  for (const [name, hex] of cats) {
    const d = deltaE(t.squii, hex);
    if (d < MIN_DELTA_E) {
      failures.push(
        `${themeName}: squii vs ${name} dE ${d.toFixed(1)} < ${MIN_DELTA_E}`,
      );
    }
  }

  // Squii's ground replaces the old landing wash. --color-ink clears 7.72:1 on
  // it, but --color-ink-muted measures only 2.23:1 and MUST NOT be used there --
  // the same trap the old wash had. Gating ink-muted here would redden the build,
  // so the rule is: anything carrying text on the ground uses --color-ink.
  const groundInk = contrast(t.ink, t.squiiGround);
  if (groundInk < MIN_TEXT_CONTRAST) {
    failures.push(
      `${themeName}: ink on squii ground ${groundInk.toFixed(2)}:1 < ${MIN_TEXT_CONTRAST}:1`,
    );
  }

  // His eyes against his own body — a graphical object, not text.
  const eyesOnBody = contrast(t.squiiInk, t.squii);
  if (eyesOnBody < MIN_GRAPHICAL_CONTRAST) {
    failures.push(
      `${themeName}: squii eyes on body ${eyesOnBody.toFixed(2)}:1 < ${MIN_GRAPHICAL_CONTRAST}:1`,
    );
  }
```

> Squii's three values are identical in both themes — he is the same character in dark mode, not an inverted one. That is deliberate: a mascot that changes colour by theme reads as two characters.

- [ ] **Step 5: Verify**

Run: `pnpm vitest run src/lib/squii.test.ts` → PASS, 5 tests.
Run: `pnpm check` → must print `Palette check passed.`

If the gate fails, fix Squii's value — never the threshold.

- [ ] **Step 6: Commit**

```bash
git add src/lib/squii.ts src/lib/squii.test.ts scripts/check-palette.ts
git commit -m "feat(squii): add brand colours, detail tiers, and palette gating"
```

---

### Task 2: The Squii glyph and the favicon

**Files:**
- Create: `src/_components/brand/squii.tsx`, `src/_components/brand/no-interpolated-classes.test.ts`
- Replace: `src/app/icon.svg`
- Rewrite: `src/lib/brand.test.ts`
- Delete: `src/lib/brand.ts`, `src/_components/landing/brand-mark.tsx`

**Interfaces:**
- Consumes: `SQUII`, `tierForSize`, `SquiiExpression` from `~/lib/squii`
- Produces: `<Squii size?: number, expression?: SquiiExpression, title?: string />`

- [ ] **Step 1: Build the glyph**

Create `src/_components/brand/squii.tsx` using the verified geometry above:

```tsx
import { SQUII, tierForSize, type SquiiExpression } from "~/lib/squii";

const MANTLE_FULL =
  "M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44 " +
  "Q20 52.5 23 44 Q26 52.5 29 44 Q32 52.5 35 44 Q38 52.5 41 44 Q44 52.5 47 44 " +
  "C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z";

const MANTLE_SMALL =
  "M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44 L47 44 " +
  "C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z";

interface SquiiProps {
  /** px; square. Drives the detail tier — never pass a tier directly. */
  size?: number;
  expression?: SquiiExpression;
  /** When present the mark is announced; otherwise it is decorative. */
  title?: string;
}

export function Squii({ size = 28, expression = "resting", title }: SquiiProps) {
  const tier = tierForSize(size);
  const body = expression === "gold" ? SQUII.gold : SQUII.body;
  const closed = expression === "shy";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className="shrink-0"
    >
      {/* Fins first, behind the mantle. This flare is what reads as a squid
          rather than a ghost — do not reorder or remove it at any tier. */}
      <ellipse cx="14.5" cy="27" rx="8.5" ry="5.2" fill={body} transform="rotate(-27 14.5 27)" />
      <ellipse cx="49.5" cy="27" rx="8.5" ry="5.2" fill={body} transform="rotate(27 49.5 27)" />
      <path d={tier === "small" ? MANTLE_SMALL : MANTLE_FULL} fill={body} />

      {closed ? (
        <>
          <path d="M19 30 q5.5 -4 11 0" fill="none" stroke={SQUII.ink} strokeWidth="2" strokeLinecap="round" />
          <path d="M34 30 q5.5 -4 11 0" fill="none" stroke={SQUII.ink} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="24.5" cy="32" rx="4.4" ry="5.4" fill={SQUII.ink} />
          <ellipse cx="39.5" cy="32" rx="4.4" ry="5.4" fill={SQUII.ink} />
        </>
      )}

      {tier === "full" && (
        <path d="M29.4 38.4 q2.6 3.2 5.2 0" fill="none" stroke={SQUII.ink} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}
```

> `wave` renders as `resting` for now — the wave is motion applied by the caller (Task 7), not a different drawing. Keep it in the union so callers can express intent.

- [ ] **Step 2: Replace the favicon**

Replace `src/app/icon.svg` entirely — Squii at the small tier, no arms, no smile, literal hexes (a static SVG cannot read CSS custom properties):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <ellipse cx="14.5" cy="27" rx="8.5" ry="5.2" fill="#fdb6c0" transform="rotate(-27 14.5 27)" />
  <ellipse cx="49.5" cy="27" rx="8.5" ry="5.2" fill="#fdb6c0" transform="rotate(27 49.5 27)" />
  <path d="M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44 L47 44 C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z" fill="#fdb6c0" />
  <ellipse cx="24.5" cy="32" rx="4.4" ry="5.4" fill="#31356b" />
  <ellipse cx="39.5" cy="32" rx="4.4" ry="5.4" fill="#31356b" />
</svg>
```

- [ ] **Step 3: Rewrite the favicon guard**

Replace `src/lib/brand.test.ts` entirely — the tile-mark tests go with `brand.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SQUII } from "./squii";

// The favicon is a static SVG, so it cannot read CSS custom properties and has
// to hardcode Squii's hexes. Nothing else checks them, which means the brand
// could move and the browser-tab mark would quietly keep the old colours.
describe("app icon", () => {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");

  it("carries only Squii's body and ink", () => {
    const hexes = new Set(
      [...svg.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toLowerCase()),
    );
    expect([...hexes].sort()).toEqual([SQUII.body, SQUII.ink].sort());
  });

  it("renders the small tier — no arms, no smile", () => {
    // The arms are quadratic curves; the smile is the only stroked path.
    expect(svg).not.toContain("Q");
    expect(svg).not.toContain("stroke");
  });

  it("keeps the fin flare, which is what makes him a squid", () => {
    expect([...svg.matchAll(/<ellipse/g)]).toHaveLength(4); // 2 fins + 2 eyes
    expect(svg).toContain("rotate(-27");
    expect(svg).toContain("rotate(27");
  });
});
```

- [ ] **Step 4: Add the interpolation guard for the new directory**

Create `src/_components/brand/no-interpolated-classes.test.ts`:

```ts
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasInterpolatedClassName } from "../landing/no-interpolated-classes.test";

const DIR = join(process.cwd(), "src/_components/brand");

describe("brand components", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} builds no class names by interpolation`, () => {
      expect(hasInterpolatedClassName(readFileSync(join(DIR, file), "utf8"))).toBe(false);
    });
  }
});
```

- [ ] **Step 5: Delete the old mark**

```bash
git rm src/lib/brand.ts src/_components/landing/brand-mark.tsx
grep -rn "BrandMark\|markBackground\|MARK_RADIUS_RATIO" src/
```

Expected: matches only in files Task 6 and Task 7 will rewrite. Leave them broken for now **only if** you complete Task 6 in the same session; otherwise stub the imports so `pnpm build` stays green. Prefer completing Task 6 before committing if the build breaks.

- [ ] **Step 6: Verify and commit**

Run: `pnpm vitest run src/lib/brand.test.ts src/_components/brand/` → PASS
Run: `pnpm check`

```bash
git add -A && git commit -m "feat(squii): add the mascot glyph and make it the favicon"
```

---

### Task 3: The wordmark

**Files:**
- Create: `src/_components/brand/wordmark.tsx`
- Delete: `src/_components/landing/wordmark.tsx`

**Verified geometry.** Authored and rendered at 80/44/30/20px on white and on the lavender ground.
`squii` is drawn as a **monoline geometric lockup**, not set in Fraunces — Tiimo's own wordmark is a
rounded geometric sans and reserves its serif for headlines, so this is closer to the reference, and
it removes any dependency on font metrics or outlining tooling. Strokes with round caps, so there
are no filled letterform curves to get wrong.

- [ ] **Step 1: Build it**

Create `src/_components/brand/wordmark.tsx`:

```tsx
import { SQUII } from "~/lib/squii";

interface WordmarkProps {
  /** Rendered height in px. The lockup scales from this. */
  height?: number;
}

/**
 * The `squii` lockup: monoline geometric letterforms, with the two dots of the
 * `ii` drawn as Squii's eyes in his navy — so the wordmark contains the mascot
 * without drawing him.
 *
 * Drawn rather than set in a webfont, deliberately. The previous brand set
 * `northstar` in Plus Jakarta Sans and overlaid a block on the `t` ascender; the
 * final review called that "the most fragile element of the brand" — a hardcoded
 * em offset tuned to one font's metrics, landing on the wrong glyph during the
 * font-swap window. Drawn strokes are font-independent and immune to FOUT. The
 * cost is unselectable text, which a logo does not need given the aria-label.
 */
export function Wordmark({ height = 30 }: WordmarkProps) {
  return (
    <svg viewBox="0 0 100 44" height={height} role="img" aria-label="squii" className="shrink-0">
      <g
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 15 C23 11 18.5 9.5 14 9.5 C9.5 9.5 5.5 11.5 5.5 15.5 C5.5 19.5 10 20.5 14.5 21.5 C19 22.5 23.5 23.5 23.5 27.5 C23.5 31.5 19 33 14.5 33 C10 33 5.5 31.5 5.5 27.5" />
        <circle cx="41" cy="21.5" r="8.5" />
        <path d="M49.5 13 L49.5 39" />
        <path d="M60 13 L60 25 A6.5 6.5 0 0 0 73 25 L73 13" />
        <path d="M73 25 L73 30" />
        <path d="M83 15 L83 30" />
        <path d="M93 15 L93 30" />
      </g>
      {/* The i-dots ARE Squii's eyes: his navy, his oval ratio. This is the
          brand detail — do not recolour them to match the letterforms. */}
      <ellipse cx="83" cy="7.5" rx="3.6" ry="4.4" fill={SQUII.ink} />
      <ellipse cx="93" cy="7.5" rx="3.6" ry="4.4" fill={SQUII.ink} />
    </svg>
  );
}
```

The letterforms use `var(--color-ink)` so the lockup inverts with the theme; the eye-dots stay
Squii's fixed navy in both themes, matching the glyph.

- [ ] **Step 2: Delete the old wordmark**

```bash
git rm src/_components/landing/wordmark.tsx
grep -rn "landing/wordmark" src/
```

Expected: matches only in files Tasks 5-8 rewrite. Update those imports to
`~/_components/brand/wordmark` as you reach them.

- [ ] **Step 3: Verify and commit**

Run: `pnpm vitest run src/_components/brand/` → PASS
Run: `pnpm check`

```bash
git add -A && git commit -m "feat(squii): add the squii wordmark with eye-dots"
```

---

### Task 4: Tokens and typography

**Files:** `src/styles/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Add Squii's tokens**

In the `@theme` block, after the category tokens:

```css
  /* Squii — brand identity, never data. Identical in both themes: he is the
     same character in dark mode, not an inverted one. */
  --color-squii: #fdb6c0;
  --color-squii-ink: #31356b;
  --color-squii-ground: #be9fe0;
```

Repeat the **same three values** in the `.dark` block (this is the one place a token deliberately does not retune).

- [ ] **Step 2: Retire the wash**

Replace `--color-wash-from: #d9d2f7;` with `--color-wash-from: var(--color-squii-ground);` in `@theme`. Leave `--color-wash-to` and both dark wash values alone.

> This retires a real defect: the old wash could not carry `--color-ink-muted` at any weight (3.51:1) — documented in `check-palette.ts` as a known un-gated hole. Squii's ground carries `--color-ink` at 7.64:1. After this change, **delete that KNOWN UN-GATED HOLE comment** from `check-palette.ts`; it no longer describes reality.

- [ ] **Step 3: Add the motion token**

After `--ease-out`:

```css
  /* Squii's easing: a soft vinyl toy in water. Buoyant, slight overshoot, soft
     settle. Deliberately distinct from --ease-out so the mascot moves
     differently from the interface and reads as a character, not a widget. */
  --ease-squish: cubic-bezier(0.34, 1.56, 0.64, 1);
```

- [ ] **Step 4: Soften Fraunces and rename the metadata**

In `src/app/layout.tsx`, keep the `axes` array exactly as is (omitting it silently loads an instance with no wonk), and update the metadata:

```ts
export const metadata: Metadata = {
  title: "squii",
  description: "a habit tracker that lights up the days you showed up",
};
```

In `globals.css`, change `.font-display`'s `"SOFT" 35` to `"SOFT" 60`.

- [ ] **Step 5: Verify and commit**

Run: `pnpm check` → `Palette check passed.`
Run: `pnpm build`

```bash
git add -A && git commit -m "feat(squii): add brand tokens, squish easing, and soften Fraunces"
```

---

### Task 5: The rename guard and the string sweep

**Files:** Create `src/lib/rename.test.ts`; modify every file it catches.

- [ ] **Step 1: Write the guard first**

```ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The rename is user-facing only: internal identifiers, package name and DB
// tables deliberately stay. This catches the visible strings — one stray page
// title or alt text survives a rename silently otherwise.
const ROOTS = ["src/app", "src/_components"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory()
      ? walk(full)
      : /\.tsx?$/.test(entry)
        ? [full]
        : [];
  });
}

describe("rename to squii", () => {
  const files = ROOTS.flatMap((r) => walk(join(process.cwd(), r)));

  it("finds files to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files) {
    it(`${file.split("/src/")[1]} carries no user-facing "northstar"`, () => {
      const source = readFileSync(file, "utf8");
      // Allowlist: the plan file path referenced in a code comment.
      const hits = [...source.matchAll(/northstar/gi)].filter(
        (m) => !source.slice(Math.max(0, m.index - 40), m.index).includes("docs/"),
      );
      expect(hits.map((m) => m[0])).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Run it and see what it catches**

Run: `pnpm vitest run src/lib/rename.test.ts`
Expected: FAILURES. Record the list — that list is your work for this task.

- [ ] **Step 3: Fix every hit**

Known at time of writing: `src/app/signin/page.tsx` (the wordmark text), `src/app/signup/page.tsx`, `src/_components/ui/sidebar.tsx`, `src/_components/landing/landing-footer.tsx`. There may be more — trust the test, not this list.

Replace visible occurrences with `squii` / `Squii`. Where the string is a brand lockup, prefer rendering `<Wordmark />` over text.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run` → whole suite green.
Run: `pnpm check && pnpm build`

```bash
git add -A && git commit -m "feat(squii): rename every user-facing string"
```

---

### Task 6: The landing page

**Files:** `landing-nav.tsx`, `landing-footer.tsx`, `landing-cta.tsx`, `hero.tsx`, `interactive-year.tsx`

- [ ] **Step 1: Swap the marks**

- `landing-nav.tsx`, `landing-footer.tsx`: replace `<BrandMark …/>` with `<Squii size={26} />` (nav) / `<Squii size={22} />` (footer), and import `Wordmark` from `~/_components/brand/wordmark`.
- `landing-cta.tsx`: replace `<BrandMark size={40} state="perfect" />` with `<Squii size={40} expression="gold" />`.

> This also settles a recorded spec violation. The old spec required the gold state to be "earned, never decorative", and the landing CTA was the only shipped use — decoratively. Gold Squii here reads as *the promise of* the reward; the earned instance lives in the app.

- [ ] **Step 2: Put Squii beside the mosaic and make the ink come from him**

In `hero.tsx`, place the mascot adjacent to the mosaic surface (below-left on mobile, left-aligned
beside it from `sm:` up).

Use the 3D render, `public/squid.png` (1254x1254), via `next/image` — NOT the flat glyph. Two
constraints from the asset itself:

- It is **RGB with no alpha**, so the lavender is baked in. It must sit on `--color-squii-ground`,
  which is set to the sampled `#be9fe0` precisely so the edges disappear. Do not place it on canvas,
  surface, or any other token.
- It is **2.1MB**. Use `next/image` with an explicit `width`/`height` and `priority` (it is
  above the fold) so it is served as an optimised, correctly-sized webp rather than the raw file.

The flat `<Squii />` glyph stays in the nav, footer and CTA; the render appears only here.

In `interactive-year.tsx`, when a tile is marked, render a short-lived ink puff in the active category's colour, originating from Squii's position and settling on the tile. Implementation notes:

- Reuse the existing `becamePerfect` / `handleToggle` flow; do not add new state machines.
- The puff is `framer-motion`, gated by `useReducedMotion()` exactly as `MosaicTile`'s pulse already is.
- **Under reduced motion the tile still changes colour instantly; only the puff is dropped.** The colour change is the answer to "did my click register" and must never be gated behind motion.
- Duration 140ms, `--ease-squish`.
- The puff is `aria-hidden` — the live region already announces the change.

- [ ] **Step 3: Verify and commit**

Run: `pnpm check && pnpm vitest run && pnpm build`

```bash
git add -A && git commit -m "feat(squii): put Squii on the landing page and let him ink the mosaic"
```

---

### Task 7: `/signin`

**Files:** `src/app/signin/page.tsx`

- [ ] **Step 1: Recompose**

Keep **all** existing logic untouched: `signIn("credentials", …)`, `handleGoogleSignIn`, the error states, the `router.push("/home")`. This is composition only.

Changes:
- Background becomes the Squii ground with the landing's grain overlay, so the handoff from the landing page is continuous.
- Replace the dot-plus-`northstar` lockup with `<Squii size={64} expression={shy ? "shy" : "resting"} />` above the card, and `<Wordmark />` beneath it.
- Submit button becomes the ink pill matching the landing CTA: `bg-[var(--color-ink)] text-[var(--color-canvas)] rounded-full`.

- [ ] **Step 2: Add the shy behaviour**

```tsx
const [shy, setShy] = useState(false);
// …
<input type="password" onFocus={() => setShy(true)} onBlur={() => setShy(false)} … />
```

> This obeys the motion principle exactly — the user did something. It is a real signal, not decoration: it says *we are not looking*, at the one moment that matters. It needs no reduced-motion path because it is a state change, not an animation.

- [ ] **Step 3: The success wave**

On successful sign-in, set `expression="wave"` before `router.push("/home")`. Signing back in **is** a return, so it reuses the warmest expression rather than inventing one. Under `useReducedMotion()` the wave renders as a static pose.

- [ ] **Step 4: Verify and commit**

Run: `pnpm check && pnpm vitest run && pnpm build`. Confirm sign-in still works against a dev server before committing.

```bash
git add -A && git commit -m "feat(squii): recompose sign-in around Squii"
```

---

### Task 8: `/signup`

**Files:** `src/app/signup/page.tsx`

- [ ] **Step 1: Recompose**

Same treatment as Task 7 — same ground, same grain, same Squii-above-card composition, same ink pill, same `shy` behaviour on the password field. Keep all account-creation logic untouched.

- [ ] **Step 2: Gold on success**

On successful signup, render `<Squii expression="gold" />` before redirecting. This is the first gold of the relationship, in the account's first second — and it is *earned*, which is what the spec requires of the gold state.

- [ ] **Step 3: Verify and commit**

Run: `pnpm check && pnpm vitest run && pnpm build`. Create a test account against a dev server and confirm the flow before committing.

```bash
git add -A && git commit -m "feat(squii): recompose sign-up around Squii"
```

---

### Task 9: Final verification

- [ ] **Step 1: Automated gate**

```bash
pnpm check    # lint + tsc + "Palette check passed."
pnpm test     # whole suite, including rename and favicon guards
pnpm build
npx prettier --check "src/**/*.{ts,tsx}"
```

- [ ] **Step 2: Confirm the old brand is gone**

```bash
grep -rn "BrandMark\|markBackground\|MARK_RADIUS_RATIO" src/   # expect nothing
grep -rln "northstar" src/app src/_components                  # expect nothing
ls src/lib/brand.ts 2>/dev/null                                # expect "No such file"
```

- [ ] **Step 3: Manual checklist** — run `pnpm dev`, private window

- [ ] Favicon is a pink squid, not a gradient square
- [ ] Squii is legible at nav size and in the browser tab
- [ ] Clicking a mosaic tile produces an ink puff from Squii
- [ ] Password focus on `/signin` and `/signup` closes his eyes; blur reopens them
- [ ] Successful signup shows gold Squii; successful signin shows the wave
- [ ] Dark mode: Squii is the same pink, the ground reads, text is legible
- [ ] Reduced motion: no puff spread, no wave, **but tile colour still changes instantly and the eyes still close**
- [ ] Squii never moves without you doing something — watch an idle page for 30s

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore(squii): final verification pass"
```

---

## Deferred, recorded now

- `/home` and `/habits` take the rename only. Squii does not appear in daily-use surfaces; their empty states and perfect-day moments deserve their own design pass.
- The `first habit` and `comeback` motion tiers from the spec are **not implemented** here — both live in the app, which is out of scope. The expression union already carries `wave` so the API does not need to change when they land.
- `public/squid.png` is used in the landing hero only (Task 6). It is not used anywhere in the app.
