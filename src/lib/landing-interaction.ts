// State transitions for the landing page's interactive mosaic. Pure and
// separate from the component so the behaviour is testable — vitest in this
// repo collects .ts only, so anything worth asserting must live here.

import { isPerfectDay } from "./mosaic";
import type { CategoryId, DayCategories } from "./types";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };

/**
 * The four control points of `--ease-squish` (globals.css), for the ink puff.
 *
 * framer-motion takes a bezier array and cannot read a CSS custom property, so
 * the token has to be restated in JS. It lives HERE rather than in the
 * component for the reason in this file's header: vitest collects `.ts` only,
 * and `landing-interaction.test.ts` reads globals.css off disk and asserts the
 * token still equals this array — the same trick `brand.test.ts` uses to pin
 * `icon.svg` to `squii.ts`. Editing one side without the other fails the suite,
 * which is what a comment alone could not do.
 */
export const INK_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

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
