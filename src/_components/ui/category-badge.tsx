import { CATEGORY_HEX, CATEGORY_LABELS } from "~/lib/constants";
import type { CategoryId } from "~/lib/types";

interface CategoryBadgeProps {
  categoryId: CategoryId;
}

export function CategoryBadge({ categoryId }: CategoryBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-black/8 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-[var(--color-ink-muted)] uppercase dark:border-white/8 dark:text-[var(--color-ink-dark-muted)]"
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: CATEGORY_HEX[categoryId] }}
      />
      {CATEGORY_LABELS[categoryId]}
    </span>
  );
}
