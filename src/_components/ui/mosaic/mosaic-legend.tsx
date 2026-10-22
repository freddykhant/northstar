import { CATEGORY_IDS } from "~/lib/constants";
import {
  tileBackground,
  tileBackgroundCompact,
  type DayCategories,
} from "~/lib/mosaic";
import { Pill } from "../primitives";

const PERFECT: DayCategories = { mind: true, body: true, soul: true };

interface MosaicLegendProps {
  /** Which view the legend sits beneath — determines whether the "Perfect
   *  day" swatch shows the compact solid tone (year) or the true three-band
   *  split (month/week), so the legend never claims a rendering the graph
   *  above it doesn't actually draw. */
  view: "year" | "month" | "week";
}

export function MosaicLegend({ view }: MosaicLegendProps) {
  // Derive from the same functions the tiles use, rather than hardcoding a
  // gradient string that could drift from the real rendering.
  const perfectBackground =
    view === "year" ? tileBackgroundCompact(PERFECT) : tileBackground(PERFECT);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORY_IDS.map((id) => (
        <Pill key={id} category={id} />
      ))}
      <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-ink-muted)]">
        <span
          aria-hidden
          className="h-3 w-3 rounded-[3px]"
          style={{
            background: perfectBackground,
            boxShadow:
              "0 0 0 1.5px var(--color-canvas), 0 0 0 2.5px color-mix(in srgb, var(--color-ink) 30%, transparent)",
          }}
        />
        Perfect day
      </span>
    </div>
  );
}
