// Pure tile logic for the activity mosaic.
//
// A day is three booleans, so there are exactly eight states. Tiles are split
// spatially rather than by blending colour, because blending destroys the
// information the mosaic exists to show. The 135deg axis and the mind/body/soul
// order are fixed in every view so that POSITION encodes identity and colour
// merely reinforces it — that is what keeps tiles readable at 11px and for
// colourblind users.

import { CATEGORY_LABELS } from "./constants";
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

/**
 * Background for a tile too small to render three bands legibly. Perfect days
 * collapse to a single tone (no information is lost — all three were kept);
 * every other state renders exactly as `tileBackground`.
 */
export function tileBackgroundCompact(c: DayCategories): string {
  if (isPerfectDay(c)) return "var(--color-perfect)";
  return tileBackground(c);
}

/** Human-readable list of kept categories, e.g. "Mind, Soul". */
export function keptLabel(c: DayCategories): string {
  const kept = activeCategories(c)
    .map((id) => CATEGORY_LABELS[id])
    .join(", ");
  return kept || "Nothing kept";
}

/** e.g. "Sat, Aug 9". Shared by every surface that names a day, so the
 *  mosaic tile's accessible name and the hover tooltip never drift apart. */
export function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Full day label for a mosaic tile, e.g. "Sat, Aug 9 — Mind, Soul". Used as
 *  both the native hover tooltip and, when focusable, the tile's
 *  `aria-label` — the two accessible names for a single day must agree. */
export function dayLabel(date: Date, c: DayCategories): string {
  return `${formatDay(date)} — ${keptLabel(c)}`;
}

/** Trims trailing zeros so 50.000 renders as 50 and 33.333 stays 33.333. */
function fmt(n: number): string {
  return String(Number(n.toFixed(3)));
}
