# Squii — Brand & Public Surfaces Design Spec

**Status:** Approved design. Ready for `superpowers:writing-plans`.
**Date:** 2026-08-26
**Supersedes:** the brand half of `2026-08-16-northstar-brand-and-landing-design.md`. That spec's
mosaic, palette and page composition decisions still stand; its *identity* decisions do not.
**Requested as:** "this is our new mascot/brand icon. northstar will now be called squii. brand and
design around him, be creative"

---

## 1. What changed and why this exists

Northstar is renamed **Squii**, with a mascot: a soft pink squid with navy eyes, rendered as a matte
vinyl toy on a lavender ground.

The rename is not cosmetic. The old identity was built on a specific idea — the mark *was* the
product's atom, emitted by `tileBackground({mind, body, soul})` — and a mascot is the opposite
strategy: a character standing beside the artifact rather than being it. That trade is made
deliberately in §3.1.

**The idea worth keeping from the rename:** a squid inks. The product's core action is marking a
day; the mascot's natural verb is inking one. So the mosaic stops being "a contributions graph for
your life" and becomes **a year of ink blots**, each in the colour of what you showed up for. The
mascot is not decoration bolted onto a habit tracker — it is the same gesture.

## 2. Decisions taken

1. **Rename scope: everything user-facing; code identifiers left alone.** Wordmark, mascot,
   favicon, page titles, metadata, README and every visible string become Squii. `package.json`,
   the repo directory, DB tables and component filenames stay. Rationale: users get a complete
   rebrand; nothing keyed to the project name (database URL, auth callbacks, deploy target) is put
   at risk for zero user-visible gain.
2. **Squii owns the identity; the three-band tile returns to being data.** See §3.1.
3. **Squii's pink is a brand token, never a category.** Measured, gated, and structurally barred
   from meaning anything in the mosaic. See §3.3.
4. **Register: calm by default, playful as reward.** The typography stays grown-up so the mascot
   can be the playful one. See §4.
5. **Deliverable: brand system + landing + auth.** App chrome (`/home`, `/habits`) takes the rename
   and nothing else. `/home` and `/habits` recomposition remains out of scope.

## 3. The brand

### 3.1 The mark

**Squii replaces the three-band tile as the identity.** The tile stops doing identity duty and goes
back to being the product's data.

The trade, stated plainly: the old mark could not drift from the artifact, because it was emitted by
the same function the app runs. That was elegant *engineering* and invisible to users. Against it, a
squid is far more recognisable at 16px than a gradient square — a risk the previous spec itself
flagged ("reads as a generic app-icon square if the split isn't drawn with enough character"). The
mascot wins on the thing marks are actually for.

**The mark is a flat vector glyph, not the 3D render.** The render is beautiful and will die at
16px. Simplification tiers are defined, not left to chance:

| size | what survives |
|---|---|
| ≥ 32px | mantle, two eyes, smile, scalloped arms |
| 20–31px | mantle, eyes, smile; arms become a soft hem |
| ≤ 19px | **mantle and two navy eyes only** |

Boundaries are inclusive and non-overlapping; the tier is derived from the `size` prop, never passed
in separately, so a caller cannot request a mismatched pair.

Two navy dots on a pink mantle is unmistakable at favicon size. The 3D render remains in use as the
hero illustration, at large sizes only.

### 3.2 The wordmark

`squii`, lowercase.

**The two dots of the `ii` are Squii's eyes** — same navy, same oval, same spacing ratio as the
mascot's. The wordmark therefore contains the mascot without drawing it. The doubled `i` is also the
device Tiimo uses, which is the stated design reference.

The `northstar` lockup and its flat-cut `t` retire with the name.

### 3.3 Palette

Squii's colours join as **brand tokens**. The category hues — mind `#6c5ce7`, body `#f2542d`, soul
`#0fa47f`, perfect-day gold `#d4a017`/`#ffce54` — remain frozen and remain the only colours that
carry meaning in the mosaic.

| token | value | role |
|---|---|---|
| `--color-squii` | `#f8a6a0` | the body |
| `--color-squii-ink` | `#31356b` | eyes; available as a display ink |
| `--color-squii-ground` | `#b5a0e5` | the lavender ground |

**Measured, not assumed** (CIE76 ΔE, same maths as `scripts/check-palette.ts`, floor is 40):

```
#f8a6a0   mind 89.8   body 51.6   soul 75.9   perfect 58.0   worst 51.6  PASS
```

Contrast: navy on white **11.34:1**; ink `#191822` on the lavender ground **7.64:1**; navy eyes on
Squii's own body **5.91:1**.

**The danger is the neighbour, not the colour.** A slightly richer rose `#f2857f` scores **37.9**
against body coral and would fail. The risk is therefore someone "enriching" Squii later, which is
why this is gated rather than written in a style note.

`--color-squii-ground` also **replaces the landing wash `--color-wash-from`**, retiring a known
defect: the old wash could not carry `--color-ink-muted` at all (3.51:1), a hole documented but not
enforceable in the gate. The lavender ground carries ink at 7.64:1.

### 3.4 Typography

**Fraunces survives, softened.** Keep `WONK: 1` and `opsz: 144`; raise `SOFT` from 35 to **60** so
terminals round toward Squii's vinyl. Plus Jakarta Sans stays for body and UI.

`next/font/google` still requires the explicit `axes: ["SOFT", "WONK", "opsz"]` array — omitting it
loads the default instance with no wonk, silently and without error.

The reasoning is the register decision: the typography stays grown-up so the mascot can be the
playful one. If both go cute, the product becomes a toy rather than something you would trust with a
bad week.

### 3.5 Expressions, and one structural rule

Squii's expression set is deliberately small: **resting** (the default everywhere), **shy** (eyes
covered), **gold** (a perfect day), **wave** (a return after absence).

> **Squii has no sad face.** He never reacts to failure. A missed week produces silence, not a frown.

This is what turns "non-judgmental" from a claim into a structural property: the mascot is incapable
of guilt-tripping the user. No "you missed a day" expression may be added later.

## 4. Motion

**One principle:**

> **Squii moves only in response to something you did.** No idle bobbing, no ambient blinking, no
> attract loop.

For a product whose stated reference point is an ADHD planning tool, a mascot animating on a timer is
a distraction competing with the task. Strictly reactive motion makes every movement a signal rather
than decoration, and it is what makes the rare moments land.

**Four tiers, from constant to rare:**

| moment | frequency | what happens | duration |
|---|---|---|---|
| Ink | many per day | small ink puff under the tile in the category colour — Squii's *medium*, not Squii | 140ms |
| Perfect day | at most once a day | he lights gold, arms lift once, settles | ~600ms |
| First habit | once ever | full-size Squii, a proper welcome | ~900ms |
| Comeback | rare | after 3+ quiet days, a slow wave — warm, not congratulatory | ~700ms |

The tiering is what prevents both failure modes. Ink is small enough to happen fifty times without
wearing out; gold caps at once a day; the comeback is rare by definition, since it can only be earned
by having been away. The one moment a habit tracker usually makes someone feel bad is the moment
Squii is warmest.

**Motion character.** A soft vinyl toy in water: buoyant, slight overshoot, soft settle. A new
`--ease-squish` token, distinct from the app's `--ease-out`. Squii uses squish; the UI keeps its own
easing, so the mascot reads as a character rather than a widget.

**Reduced motion — remove the performance, keep the feedback:**

- Ink puff → the tile still changes colour instantly; the puff does not spread
- Perfect day → Squii still turns gold; he does not lift
- Comeback → static greeting pose, no wave

Under `prefers-reduced-motion` Squii still responds to everything. He simply stops performing.

## 5. Surfaces

### 5.1 Landing page

The copy survives the rename — "Your year, in three colours.", the contributions-graph rebuttal and
the lopsided month never named the product. What changes:

- Nav and footer take the Squii glyph and the `squii` lockup; the tile mark leaves chrome.
- The wash becomes `--color-squii-ground` (see §3.3).
- The CTA's gold mark becomes **gold Squii**.

**This also fixes a recorded spec violation.** The previous spec required the gold state to be
"earned, never decorative", and the landing CTA used it decoratively — the only shipped use of gold
was the one that broke the rule. Gold Squii on the landing page reads as *the promise of* the reward;
the earned instance stays in the app, on a real perfect day.

**The hero gains the central idea:** Squii sits at the edge of the interactive mosaic, and **clicking
a tile makes the ink puff come from him.** Mascot, action and artifact become one gesture. A stranger
does not need to be told "he inks your day" — they do it, and it explains itself.

### 5.2 Auth pages

The real new composition work. Currently 375 lines of utility form on flat canvas — the point where
the brand evaporates, immediately after the landing page's only job is to deliver someone here.

- Same lavender ground and grain as the landing, so the handoff is continuous.
- Single centred column: generous, calm, no split-screen layout.
- Squii above the card, form below, submit as the ink pill matching the landing CTA.

**The detail this page exists for:**

> **Focus the password field and Squii covers his eyes.**

It obeys the motion principle exactly — the user did something. It is a real signal rather than
decoration: it says *we are not looking*, at the one instant that matters. On blur, he uncovers.

Per-page flow, reusing the defined expression set rather than inventing new ones:

- **Signup:** resting → shy on password focus → **gold on success.** The first gold of the
  relationship, in the account's first second.
- **Signin:** resting → shy on password focus → **wave on success.** Signing back in *is* a return,
  so it reuses the warmest expression.

**Unchanged:** the auth logic itself, the mosaic's meaning, the category hues, and every sign-up
conversion path. This is composition and brand, not a rewrite of how login works.

### 5.3 App chrome

`/home` and `/habits` take the rename only — sidebar wordmark, page titles, metadata, any visible
"Northstar" string. No recomposition. Squii does not yet appear in daily-use surfaces; that is a
deliberate later decision, since the empty states and perfect-day moments there deserve their own
design pass.

## 6. Architecture

| file | responsibility |
|---|---|
| `src/_components/brand/squii.tsx` | The glyph. `size` (drives the tier), `expression: "resting" \| "shy" \| "gold" \| "wave"` |
| `src/_components/brand/wordmark.tsx` | The `squii` lockup, as SVG paths |
| `src/lib/brand.ts` | Rewritten: Squii's colour constants. `MARK_RADIUS_RATIO` retires with the tile mark |
| `src/app/icon.svg` | Squii at the 16px tier — mantle and eyes, literal hexes |

Expressions live as state inside a single SVG, not as four files, so the mark cannot drift between
moods.

**The wordmark is drawn, not set in a webfont — deliberately.** The tempting approach is to set
`squii` in Fraunces and place two navy dots over the `ii`. That is exactly the pattern used for the
old flat-cut `t`, which the final review of the previous branch named "the most fragile element of
the brand": a hardcoded em offset tuned to one font's metrics, landing on the wrong glyph during the
font-swap window.

**Revised during planning (2026-08-27):** the drawn form is a **monoline geometric lockup** rather
than outlined Fraunces. Three reasons, and the first is the one that matters: Tiimo's own wordmark is
a rounded geometric sans and reserves its serif for headlines, so a geometric `squii` is closer to
the stated reference than an outlined serif would be. It also suits a vinyl-toy mascot better than an
editorial serif, and it removes any dependency on font-outlining tooling. Strokes with round caps
mean there are no filled letterform curves to get wrong.

Font-independent and immune to FOUT either way, at the cost of selectable text — acceptable for a
logo carrying `role="img"` and `aria-label="squii"`.

**Motion** uses framer-motion, already a dependency and already the pattern in `MosaicTile` (which
uses `useReducedMotion`). `--ease-squish` goes in `globals.css` beside `--ease-out`.

**The 3D render is an asset this repo does not have.** It exists only in the conversation. To use it
in the hero it must be added to `public/` (e.g. `public/squii.png`). If it is unavailable, a large
flat Squii is an acceptable substitute and is arguably more coherent beside flat UI — but the render
is the better object and should be used if it can be supplied.

## 7. Testing

Constraints are unchanged: Vitest collects `src/**/*.test.ts` only, `environment: "node"`, no React
testing library. Coverage is therefore pure logic and source-file linting.

1. **Favicon guard, extended** — `icon.svg`'s colours must equal the Squii constants, mirroring the
   existing test that pins the category hexes.
2. **Rename guard** — scan `src/app/**` and `src/_components/**` for user-facing `northstar`
   strings, with a narrow allowlist for the internal identifiers this job deliberately leaves alone.
   Without it, one stray page title or `alt` text survives the rename silently.
3. **Interpolated-class guard, extended** to cover `src/_components/brand/`.
4. **Palette gate** — `scripts/check-palette.ts` gains Squii's tokens, an assertion that his pink
   holds ΔE ≥ 40 against mind, body, soul and gold, and a comment naming `#f2857f` (37.9, fails) so
   the failing neighbour is documented rather than rediscovered.

**Explicitly not tested: whether Squii looks right.** That needs eyes. The previous branch's manual
browser checklist is still un-run, and this spec stacks a second unverified visual layer on the
first — that debt should be cleared before or alongside this work, not after.

## 8. Definition of done

- No user-facing "Northstar" string remains on any surface; the rename guard passes.
- Squii is the favicon and the nav mark, and is legible at 16px.
- The landing page reads as one brand from nav to footer, and the auth pages continue it rather than
  dropping to a utility form.
- Squii responds to marking a day, to password focus, and to a perfect day — and to nothing else. He
  never animates on failure and never animates unprompted.
- `pnpm check` passes, including the extended palette gate; `pnpm test` and `pnpm build` pass.
- Reduced-motion paths present for every expression; light and dark both first-class.
- No regression to the sign-up conversion path.
