# Landing Page Uplift — Design Brief (queued, not yet a spec)

**Status:** Queued. **This is not an implementable spec yet.** It captures context, constraints
and the decisions that still need making. It becomes a spec after a brainstorming pass — the
open questions in §5 are genuine design decisions and must not be answered unilaterally.

**Date queued:** 2026-08-13
**Requested as:** "an uplift job for landing page and all outdated UI"

---

## 1. Why this exists

The mosaic redesign rebuilt `/home` and the design system around it. A follow-up branch
(`design/system-migration`) then migrates the four remaining surfaces — the landing page,
`/habits`, `/signin`, `/signup` — onto that system.

**That migration is explicitly a re-skin, not a redesign.** It swaps tokens, adopts the type
scale and the primitives, and retires the paper palette. It makes those pages *consistent*. It
does not make them *well composed*.

For `/habits` and the auth pages, consistency is most of what they need — they are utility
surfaces. **The landing page is different**, and that is why it gets its own job:

- It is the only surface whose reader has never used Northstar. Its job is persuasion, not
  daily use.
- Applying app-dashboard tokens to a marketing page is a known failure mode: it produces
  something tidy and forgettable. The app's largest type step (`text-display`, 34px) is a
  *page heading* size; a hero headline that has to stop a stranger legitimately wants more.
- This concern was raised at the original scoping and deferred then: landing "is a different
  design problem (persuasion, not use) — likely deserves its own spec."

## 2. Current state

| File | Lines | Notes |
|---|---|---|
| `src/app/page.tsx` | 360 | The page itself. Will be token-migrated by the `design/system-migration` branch. |
| `src/_components/landing/unified-demo.tsx` | 334 | An interactive demo. Carries its **own local colour map**, independent of the design system. |
| `src/_components/landing/landing-footer.tsx` | 104 | Uses no old tokens. |

**Starting point when this job begins:** the page will already be on the new tokens, type scale
and primitives. That is a better foundation than the retired paper palette — the redesign
starts from a coherent vocabulary rather than having to migrate and redesign at once.

## 3. What the product actually is

The pitch, from the README: *"A habit tracker that lights up squares like the greens in your
GitHub profile, making it rewarding to see the fruits of your consistency."*

The differentiator, and almost certainly the hero of any redesign: **the mosaic**. Northstar is
"GitHub, but for your daily life" — and unlike GitHub's single green, each day's tile is divided
by which part of life you showed up for: mind, body, soul. Zoomed out, a year becomes a woven
three-colour record that shows not just *whether* you showed up but *which part of your life you
showed up for*. A lopsided month is visible at a glance.

That is the thing a stranger needs to understand in about three seconds.

## 4. Constraints that are already settled

These come from the shipped design system and are not open for re-litigation:

- **Palette:** mind `#6c5ce7`, body `#f2542d`, soul `#0fa47f`; perfect-day gold `#d4a017`
  (`#ffce54` dark). Enforced by `scripts/check-palette.ts` in `pnpm check`.
- **Typeface:** Plus Jakarta Sans. The serif layer is retired.
- **Light-first, dark at parity.** Dark values are independently tuned, never inverted.
- **Every animation needs a `prefers-reduced-motion` path.** Non-negotiable — the design's
  reference point is an ADHD planning tool.
- **Reuse the primitives** (`Card`, `Pill`, `Stat`, `SegmentedControl`) where they fit; do not
  grow them props to force a fit.
- Marketing may exceed the app's type scale where the composition earns it — but say so
  deliberately rather than drifting.

## 5. Open questions — resolve these in brainstorming

**Do not answer these alone. They are the design.**

1. **What is the hero?** A live/animated mosaic filling in, a static year at full bleed, the
   existing interactive demo promoted, or something else entirely?
2. **How much motion?** The mosaic filling in over time is the obvious idea and could be
   striking — but it is also the kind of thing that reads as a gimmick on second visit, and it
   carries a reduced-motion cost.
3. **What is the emotional register?** The app is calm, warm and non-judgmental. Should the
   landing page match that, or run louder to convert?
4. **Does `unified-demo.tsx` survive?** It carries its own colour map, so it is currently
   inconsistent with the real product. Bring it onto the system, rebuild it around the actual
   mosaic components, or drop it in favour of something simpler?
5. **What is the page's structure?** Currently a conventional stack. Does the uplift keep that,
   or commit to a stronger composition?
6. **Is there a second surface in scope?** The request said "landing page and all outdated UI."
   After the migration branch lands, no surface is on the old design — so "outdated" may mean
   *composition* rather than *tokens*. Worth confirming whether `/habits` also wants recomposing,
   which the migration deliberately does not do.

## 6. Definition of done (provisional)

- A stranger understands what Northstar does, and why the three-colour mosaic is different from
  a contributions graph, without scrolling.
- The page reads as designed rather than as the app's tokens applied to a marketing layout.
- `pnpm check`, `pnpm test` and `pnpm build` pass; reduced-motion paths present; light and dark
  both first-class.
- No regression to the sign-up conversion path.

## 7. How to start this job

1. `superpowers:brainstorming` — work through §5. Expect to look at real mockups; this is a
   visual problem and describing it in prose will under-serve it.
2. That produces the actual spec, in `docs/superpowers/specs/`.
3. Then `superpowers:writing-plans`, then execution.

**Prerequisite:** the `design/system-migration` branch should land first, so this starts from
the new design system rather than migrating and redesigning simultaneously.
