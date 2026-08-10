"use client";

import { useMemo } from "react";
import type { DayCategories } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";
import { MosaicTile } from "./mosaic-tile";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };
const TILE = 11;
const GAP = 3;

interface MosaicYearProps {
  completionMap: Map<string, DayCategories>;
  onHover?: (date: Date, c: DayCategories, e: React.MouseEvent<HTMLElement>) => void;
  onLeave?: () => void;
  todayKey?: string;
  pulseToday?: boolean;
}

export function MosaicYear({
  completionMap,
  onHover,
  onLeave,
  todayKey,
  pulseToday = false,
}: MosaicYearProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    // Back up to the Sunday on or before Jan 1 so every column is a full week.
    start.setDate(start.getDate() - start.getDay());

    const cols: Date[][] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const col: Date[] = [];
      for (let d = 0; d < 7; d++) {
        col.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(col);
    }
    return cols;
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((col, i) => {
      const first = col[0]!;
      if (first.getMonth() !== lastMonth && first.getDate() <= 7) {
        lastMonth = first.getMonth();
        labels.push({
          index: i,
          label: first.toLocaleDateString("en-US", { month: "short" }),
        });
      }
    });
    return labels;
  }, [weeks]);

  const today = new Date();

  return (
    <div className="overflow-x-auto pb-1">
      <div style={{ minWidth: weeks.length * (TILE + GAP) }}>
        <div className="relative mb-1.5 h-3">
          {monthLabels.map((m) => (
            <span
              key={`${m.label}-${m.index}`}
              className="absolute text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase"
              style={{ left: m.index * (TILE + GAP) }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {weeks.map((col, i) => (
            <div key={i} className="flex flex-col" style={{ gap: GAP }}>
              {col.map((date) => {
                const key = formatDateAsLocal(date);
                const future = date > today;
                const categories = completionMap.get(key) ?? EMPTY;
                return (
                  <div key={key} style={{ opacity: future ? 0 : 1 }}>
                    <MosaicTile
                      categories={categories}
                      size={TILE}
                      radius={2}
                      pulse={pulseToday && key === todayKey}
                      onEnter={(e) => !future && onHover?.(date, categories, e)}
                      onLeave={onLeave}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
