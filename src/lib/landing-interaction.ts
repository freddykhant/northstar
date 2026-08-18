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
