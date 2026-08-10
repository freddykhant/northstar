import { CATEGORY_LABELS } from "~/lib/constants";
import type { CategoryId } from "~/lib/types";

interface PillProps {
  category: CategoryId;
}

export function Pill({ category }: PillProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        backgroundColor: `color-mix(in srgb, var(--color-${category}) 14%, transparent)`,
        color: `var(--color-${category}-ink)`,
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `var(--color-${category})` }}
      />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
