/**
 * CategoryBadge - Reusable badge for displaying categories
 */

import type { CategoryId } from "~/lib/types";
import { CATEGORY_COLORS } from "~/lib/constants";

interface CategoryBadgeProps {
  categoryId: CategoryId;
}

export function CategoryBadge({ categoryId }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[categoryId];

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors.badge}`}
    >
      {categoryId}
    </span>
  );
}
