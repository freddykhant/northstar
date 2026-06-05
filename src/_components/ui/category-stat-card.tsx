import {
  CATEGORY_HEX,
  CATEGORY_LABELS,
} from "~/lib/constants";
import type { CategoryId } from "~/lib/types";

interface CategoryStatCardProps {
  categoryId: CategoryId;
  count: number;
}

export function CategoryStatCard({ categoryId, count }: CategoryStatCardProps) {
  return (
    <div className="rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-5 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: CATEGORY_HEX[categoryId] }}
        />
        <span className="text-[11px] font-medium tracking-[0.12em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
          {CATEGORY_LABELS[categoryId]}
        </span>
      </div>
      <div
        className="tabular font-serif text-[32px] leading-none font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
        style={{ fontOpticalSizing: "auto", letterSpacing: "-0.02em" }}
      >
        {count}
      </div>
      <div className="mt-1 text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
        completed today
      </div>
    </div>
  );
}
