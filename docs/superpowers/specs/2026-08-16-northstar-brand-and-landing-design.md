# Northstar Brand & Landing Page — Design Spec

**Status:** Approved design. Ready for `superpowers:writing-plans`.
**Date:** 2026-08-16
**Supersedes the open questions in:** `2026-08-13-landing-page-uplift-brief.md`
**Requested as:** "I want to create a brand and logo, Northstar's new UI is heavily inspired by
Tiimo. I want a landing page beautiful and interactive."

---

## 1. Scope

In scope: the public landing page and the brand identity it carries.

| File | Fate |
|---|---|
| `src/app/page.tsx` | Rewritten. The printed-almanac conceit is retired. |
| `src/_components/landing/unified-demo.tsx` | **Deleted.** |
| `src/_components/landing/landing-footer.tsx` | Rebuilt on design tokens. |

Out of scope: `/home`, `/habits`, `/signin`, `/signup`. No app surface changes. This resolves
brief §5.6 — "outdated UI" means the landing page's *composition*, not a second surface.

## 2. Decisions taken

These answer the brief's §5 open questions and are settled.

1. **The almanac conceit is retired** (§5.1, §5.3, §5.5). `Vol. I`, the roman-numeral year, the
   ornamental star rules, the Annie Dillard epigraph, the mind/body/soul table of contents and
   the `p. 002` folios all go. The page leads with the artifact instead: the mosaic makes the
   argument. The conceit was built for the retired paper/serif layer and now reads as costume.
2. **Brand scope is mark + wordmark.** The palette is *not* reopened. Mind `#6c5ce7`, body
   `#f2542d`, soul `#0fa47f` and perfect-day gold `#d4a017` / `#ffce54` are frozen;
   `scripts/check-palette.ts` is untouched and must keep passing unchanged.
3. **An editorial serif returns, for the landing page's display type only** — a documented
   exception to the brief's "the serif layer is retired." The app remains entirely Plus Jakarta
   Sans. Justification: the serif is Tiimo's actual signature (§3), and the brief already permits
   marketing to exceed the app's type scale "where the composition earns it." This extends that
   permission from size to typeface, deliberately and in writing.
4. **The hero is interactive, not animated** (§5.2). The visitor paints days. Rejected:
   scroll-driven fill and ambient auto-fill — both are performances that read as gimmicks on a
   second visit, and both fall back to a static year under reduced motion anyway.
5. **`unified-demo.tsx` is deleted, not repaired** (§5.4).

## 3. The Tiimo reference, verified

Checked against tiimoapp.com on 2026-08-16 rather than recalled. What is actually being borrowed:

- **Serif-led display type.** Headlines are a high-contrast editorial serif with playful curves;
  the rounded geometric sans is confined to the wordmark and UI chrome. The serif appears
  in-product too. This is the single largest driver of their character.
- **Atmosphere over flat fills.** Full-bleed lavender/periwinkle gradient washes with a visible
  grain overlay, shifting band to band between sections. Nothing is a flat solid.
- **Pill geometry.** Fully-rounded nav buttons, a solid ink pill CTA against a quiet cream
  secondary, circular pastel icon chips, generously rounded cards.
- **Composition.** Very large type, centred hero, left-aligned section heads thereafter,
  generous negative space.

Explicitly *not* borrowed: their palette, their illustration style, their lowercase-brand naming.
Northstar's category colours carry the colour story.

## 4. The brand

### 4.1 The mark

A squircle carrying three hard-stop diagonal bands at 135° — violet, coral, teal, in fixed
mind/body/soul order.

**The mark is not a new drawing.** `src/lib/mosaic.ts:36` already renders a three-category day as
`linear-gradient(135deg, …)` with hard stops, and documents why: *"blending destroys the
information the mosaic exists to show… POSITION encodes identity and colour merely reinforces
it."* A perfect day therefore already **is** the mark:

```ts
tileBackground({ mind: true, body: true, soul: true })
```

The identity is emitted by the same code path the product runs, so the logo cannot drift from the
artifact. Implementations must call the function, not hardcode the gradient.

Two states:

| State | Value | Used for |
|---|---|---|
| Resting | `tileBackground` three-band tile | Everyday mark, nav, favicon, app icon |
| Perfect | `tileBackgroundCompact` → `--color-perfect` gold | Signup success; earned, never decorative |

The gold state inherits its "all three kept" semantics from `tileBackgroundCompact` rather than
inventing new ones.

**Corner radius** is the one deliberate departure. Tiles cap at `--radius-tile-week: 12px`; the
mark uses a true squircle at **28% of its own width** (so 9px at 32px, 4.5px at 16px) to sit
correctly in the Tiimo roundness. Expressed as a percentage so it scales with the mark. This is a
mark-only value and must **not** become a new radius token.

### 4.2 The wordmark

Lowercase `northstar`, Plus Jakarta Sans at its heaviest weight, tightly tracked — deliberately
echoing Tiimo's lowercase-sans wordmark, which is the register being targeted.

One custom detail: the **t** ascender is cut flat and shortened to the x-height of the
surrounding letters, so it reads as a tile edge rather than a stem. Ownable, and it survives at
small sizes.

The existing `letterSpacing: 0.42em` uppercase `NORTHSTAR` treatment is retired with the almanac.

### 4.3 Display typeface

**Fraunces**, variable, self-hosted via `next/font/google`.

```ts
Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"] })
```

**The `axes` array is required.** Omit it and the default instance loads with no wonk at all —
the font arrives, the character silently does not, and nothing errors.

Display settings: `opsz` near 144 (high contrast and tight, pulling editorial rather than
craft-revival), `WONK: 1` for the splayed *y* leg and canted *g*, `SOFT` 30–40 to round terminals
without going gummy.

Next fonts are per-route, so this loads on the landing bundle only. `/home` and the app never pay
for it.

### 4.4 Voice

Warm, plain, second-person, non-judgmental — the app's existing register, which already matches
Tiimo's. No streak-shame, no urgency, no loss-aversion. *"Some days you'll only get one."* rather
than *"Don't break your chain."*

## 5. Page composition

Five movements. Centred hero, left-aligned section heads thereafter.

### 5.1 Nav

Mark + wordmark left. `Log in` as a quiet cream pill, `Start tracking` as a solid ink pill,
right. Replaces the current fixed top-right uppercase "Sign in" link.

### 5.2 Hero — the artifact does the talking

Full-bleed lavender gradient wash carrying the grain overlay currently at `page.tsx:107` (CSS
only, no asset — it survives the redesign). Centred Fraunces headline at
`clamp(40px, 6vw, 64px)`, well past the app's 34px `--text-display`.

> **Your year, in three colours.**
> Mind, body, soul — one square a day. See which part of your life you're actually showing up for.

The headline carries two *y*'s and a *g*, where Fraunces' wonk is most visible. Any rewrite should
preserve descenders in the display line.

Beneath it, the interactive mosaic in a generously rounded surface, pulled up to **overlap the
section boundary** so it breaks the grid rather than stacking. A quiet `click a day` prompt makes
the interactivity discoverable — an interactive hero nobody touches is just a picture.

### 5.3 The GitHub answer

The brief's hardest success criterion is that a stranger sees why this is not a contributions
graph. So show it: the same year rendered twice, side by side — once in GitHub's single green,
once in Northstar's three colours. The green one says *you were busy*; the woven one says *what
you were busy with*. The README already frames the product against GitHub, so this is on-message.

This section makes its argument *in colour*, so it must carry explicit text labels — the
comparison cannot rest on the visual alone.

### 5.4 A lopsided month

One month at large tile size where body is visibly absent — violet and teal, almost no coral.
Straight from the brief: *"a lopsided month is visible at a glance."* Copy names it without
scolding: some months you keep your mind and lose your body, and the point is that you can see it.

The seed must produce this deliberately, not by luck. See §7.

### 5.5 Close

Mind/body/soul as three rounded cards with pastel category chips, then the CTA, then the rebuilt
footer.

## 6. Architecture

### 6.1 The hero paints; it does not split

`mosaic-year.tsx:9` sets `TILE = 11`. Hovering to split a tile into thirds and clicking one third
gives a 3.6px target — unhittable with a mouse, hopeless on touch. Rejected.

Instead: a `SegmentedControl` (existing primitive, fits without new props) selects mind, body or
soul; clicking a day toggles *that* category on *that* day. Pick a colour, mark your days, watch a
perfect day go gold. This teaches the product's real gesture — choose a category, mark the day —
and the target is a whole tile.

Hero tiles are **18px with a 4px gap across the most recent 20 whole weeks** (7 rows × 20
columns, ending on the reference date's week), so they are touchable. The full 11px year appears
in §5.3, where it is read rather than operated.

The 18px tile is still below the 44px pointer-target guideline. This is accepted deliberately: a
mosaic's meaning depends on density, and enlarging tiles to 44px destroys the woven read that the
hero exists to demonstrate. The keyboard path in §8 is the equal-access route, not a fallback —
it must work completely.

### 6.2 Reuse the atoms, not the assembled view

The hero gets its own `InteractiveYear`. It composes `MosaicTile` and `tileBackground` directly
and takes an **explicit reference date**.

It must **not** be built by adding props to `MosaicYear`, for two reasons:

1. The brief forbids growing primitives to force a fit, and a read-only product view should not
   learn click-to-edit for a marketing page's benefit.
2. `MosaicYear` computes `new Date()` inside `useMemo` (`mosaic-year.tsx:31`). It is a
   `"use client"` component but Next still server-renders it, so server and client can disagree
   across a timezone or midnight boundary and produce differently-shaped grids. The landing page
   must not inherit that latent hydration risk. *(The risk in `MosaicYear` itself is noted here as
   a finding; fixing it is out of scope for this job.)*

### 6.3 Files

New, in `src/_components/landing/`:

| Component | Notes |
|---|---|
| `brand-mark.tsx` | Server-safe; calls `tileBackground`, never hardcodes the gradient |
| `wordmark.tsx` | |
| `landing-nav.tsx` | |
| `hero.tsx` | Server; headline, wash, grain |
| `interactive-year.tsx` | **The only `"use client"` piece** |
| `comparison.tsx` | §5.3 |
| `lopsided-month.tsx` | §5.4 |
| `categories.tsx` | |
| `landing-cta.tsx` | |
| `landing-footer.tsx` | Rebuilt on tokens |

New, in `src/lib/`: `landing-seed.ts` — a seeded `mulberry32` generator producing a plausible year
from a fixed constant. Pure, dependency-free, no `Math.random`, no ambient `Date`. SSR and client
must agree byte for byte.

Deleted: `unified-demo.tsx`.

### 6.4 What deleting the demo resolves

One move closes three findings from the migration review:

- **§5.4** — the `Card`-wrapping-a-hardcoded-`rounded-3xl border-zinc-200 bg-white` seam at
  `page.tsx:325`.
- **Finding B** — `unified-demo.tsx:238` builds class names by interpolation
  (`` from-${…}-50 ``), which Tailwind cannot see. Verified never to have rendered.
- **Finding C** — the local `CATEGORY_COLORS` blue/red/purple map, which advertised the product in
  colours the product does not use.

## 7. Motion

**One orchestrated load, then stillness.** The page reveals once: headline rises, then hero tiles
sweep in along the same 135° diagonal the tiles are split on — stagger keyed off
`weekIndex + dayIndex`, so the reveal traces the mark's own geometry. The segmented control lands
last. Reuses the existing `animate-rise-in`.

Later sections reveal once on entry via `IntersectionObserver`. Nothing scrubs, nothing loops,
nothing replays. The gradient wash and grain are static.

**Interaction feedback** is fast and small: `--duration-fast` (140ms) with `--ease-out` on the
tile background, a slight scale on press, and a gold ring pulse when a day completes to perfect.
That pulse is the page's only celebratory moment, which is what keeps it worth something.

## 8. Accessibility

**Reduced motion removes effect, not feedback.** Under `prefers-reduced-motion: reduce`: no
stagger, no sweep, no scale, no pulse — every section renders in final state immediately. But
**colour still changes instantly on click**. That is not decoration; it is the answer to "did my
click register." Removing it would break the interaction for precisely the users the brief names
as the design's reference point.

Gated in CSS media queries rather than JS, so it holds before hydration.

**The interactive mosaic:**

- Each tile is a real `<button>` with `aria-pressed` and an `aria-label` from the existing
  `dayLabel`, so the hero and the app narrate days identically.
- A **roving tabindex** with arrow-key navigation keeps ~150 tiles as one tab stop, not 150.
- A throttled polite live region announces the new state on toggle.
- Colour is never the sole carrier: the fixed 135° band order already encodes category by
  position. This is the system's existing colourblind story, not a new one.

**Theming.** Light-first, dark at parity. The lavender wash gets an independently tuned
deep-aubergine counterpart — a retuned value, never an inversion. Focus rings tuned separately per
theme. The Fraunces headline is verified at 4.5:1 against both washes.

## 9. Testing

Vitest over the pure parts, which is where the risk concentrates:

1. **Seed determinism** — same seed produces an identical map across two invocations.
2. **`toggleCategory` reducer** — extracted as a pure function, including the transition into and
   out of perfect-day.
3. **Lopsided month** — assert the seed produces a month with body markedly sparser than mind and
   soul. §5.4's argument depends on it, so it cannot be left to luck.
4. **No interpolated class names** — a guard test asserting no template-literal class construction
   under `src/_components/landing/`. Finding B proved this failure is invisible to types, lint and
   build; only a test catches it.

## 10. Definition of done

- A stranger understands what Northstar does, and why the three-colour mosaic differs from a
  contributions graph, without scrolling.
- The page reads as designed, not as app tokens applied to a marketing layout.
- `pnpm check` passes — including `check-palette.ts`, **unchanged**, since no new hues.
- `pnpm test` and `pnpm build` pass.
- Reduced-motion paths present and verified; light and dark both first-class.
- No regression to the sign-up conversion path.
- `unified-demo.tsx` deleted; no zinc/black/white literals remain in `src/_components/landing/`.
