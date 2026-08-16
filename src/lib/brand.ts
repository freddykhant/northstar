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
