import { MosaicTile } from "~/_components/ui/mosaic";
import { buildDemoYear, parseDayKey } from "~/lib/landing-seed";
import { activeCategories, tileBackgroundCompact } from "~/lib/mosaic";
import type { DayCategories } from "~/lib/types";

const TILE = 9;
const GAP = 3;
const DAYS = 182; // 26 weeks — a legible half-year at 9px
const ROWS = 7;

/** GitHub's contribution greens, one per reachable state (0-3 categories kept).
 *  Deliberately literal and deliberately NOT a token: this depicts a different
 *  product, and must never become part of Squii's palette. Four entries, not
 *  five — a day has at most three categories, so a five-step ramp would leave the
 *  darkest green unreachable and make the comparison look rigged. */
const CONTRIB_GREENS = ["#ebedf0", "#9be9a8", "#40c463", "#216e39"] as const;

/** The panel the greens are painted on. Fixed in BOTH themes, and a local
 *  literal for the same reason the greens are.
 *
 *  The greens are GitHub's LIGHT-mode ramp: CONTRIB_GREENS[0] is its empty
 *  tile. Painted straight onto Squii's dark canvas (#131219) they inverted
 *  the figure's whole argument — an empty day hit 15.87:1 and became the
 *  brightest object on the page, while a three-category day sank to 2.97:1 and
 *  nearly vanished. The section is captioned "did you show up?"; it cannot
 *  render not-showing-up as the loudest thing in it. Light mode had the milder
 *  version of the same problem, the empty green sitting at 1.06:1 on canvas.
 *
 *  So the figure gets its own surface. It depicts another product's light UI,
 *  and showing it on that product's own surface tone is honest rather than a
 *  cheat. Only the GitHub grid is wrapped — the Squii figure uses tokens
 *  and belongs on canvas by design. */
const GITHUB_SURFACE = "#f6f8fa";

function greenFor(day: DayCategories): string {
  return CONTRIB_GREENS[activeCategories(day).length]!;
}

export function Comparison({ referenceKey }: { referenceKey: string }) {
  const days = [...buildDemoYear(parseDayKey(referenceKey), DAYS).values()];

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
            <div
              className="overflow-x-auto rounded-[var(--radius-card)] p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
              style={{ background: GITHUB_SURFACE }}
              role="img"
              aria-label="Six months of a contribution graph in one colour: the same days as the figure beside it, shown only as busy or not"
              tabIndex={0}
            >
              <div className="grid grid-flow-col" style={grid}>
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
            </div>
          </figure>

          <figure>
            <figcaption className="mb-3 text-[13px] font-semibold text-[var(--color-ink)]">
              Three colours &mdash; which part of you showed up?
            </figcaption>
            <div
              className="grid grid-flow-col overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
              style={grid}
              role="img"
              aria-label="The same six months in three colours: mind, body and soul each keep their own colour on every day"
              tabIndex={0}
            >
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
