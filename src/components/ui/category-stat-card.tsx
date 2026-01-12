/**
 * CategoryStatCard - Reusable stat card for each category
 */

import type { CategoryId } from "~/lib/types";
import { CATEGORY_COLORS, CATEGORY_EMOJIS, CATEGORY_LABELS } from "~/lib/constants";

interface CategoryStatCardProps {
  categoryId: CategoryId;
  count: number;
}

export function CategoryStatCard({ categoryId, count }: CategoryStatCardProps) {
  const colors = CATEGORY_COLORS[categoryId];
  const emoji = CATEGORY_EMOJIS[categoryId];
  const label = CATEGORY_LABELS[categoryId];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all hover:scale-[1.02] ${colors.card} ${colors.cardHover}`}
    >
      <div
        className={`absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full blur-3xl transition-opacity group-hover:opacity-100 ${colors.glow}`}
      />
      <div className="relative">
        <div className="mb-2 text-3xl">{emoji}</div>
        <div className={`mb-1 text-sm font-medium ${colors.text}`}>
          {label}
        </div>
        <div className="text-2xl font-bold text-white transition-all duration-300">
          {count}
        </div>
        <div className="text-xs text-zinc-500">completed today</div>
      </div>
    </div>
  );
}
