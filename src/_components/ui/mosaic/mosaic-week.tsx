"use client";

import { useMemo } from "react";
import { keptLabel, type DayCategories } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";
import { MosaicTile } from "./mosaic-tile";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };

interface MosaicWeekProps {
  completionMap: Map<string, DayCategories>;
}

export function MosaicWeek({ completionMap }: MosaicWeekProps) {
  const days = useMemo(() => {
    const out: Date[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      out.push(d);
    }
    return out;
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {days.map((date) => {
          const key = formatDateAsLocal(date);
          const categories = completionMap.get(key) ?? EMPTY;
          return (
            <div key={key} className="text-center">
              <MosaicTile
                categories={categories}
                size={60}
                radius="var(--radius-tile-week)"
                title={keptLabel(categories)}
              />
              <div className="mt-2 text-eyebrow text-[var(--color-ink-muted)] uppercase">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
