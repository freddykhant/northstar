import { CATEGORY_IDS } from "~/lib/constants";
import { Pill } from "../primitives";

export function MosaicLegend() {
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
            background:
              "linear-gradient(135deg, var(--color-mind) 0% 33.333%, var(--color-body) 33.333% 66.667%, var(--color-soul) 66.667% 100%)",
            boxShadow:
              "0 0 0 1.5px var(--color-canvas), 0 0 0 2.5px color-mix(in srgb, var(--color-ink) 30%, transparent)",
          }}
        />
        Perfect day
      </span>
    </div>
  );
}
