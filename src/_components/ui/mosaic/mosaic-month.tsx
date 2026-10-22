"use client";

import { useMemo } from "react";
import { dayLabel, type DayCategories } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";
import { MosaicTile } from "./mosaic-tile";

const EMPTY: DayCategories = { mind: false, body: false, soul: false };
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface MosaicMonthProps {
  completionMap: Map<string, DayCategories>;
}

export function MosaicMonth({ completionMap }: MosaicMonthProps) {
  const { cells, today } = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const out: (Date | null)[] = Array(first.getDay()).fill(
      null,
    ) as (Date | null)[];
    for (let d = 1; d <= last.getDate(); d++) {
      out.push(new Date(now.getFullYear(), now.getMonth(), d));
    }
    return { cells: out, today: now };
  }, []);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-[7px]">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-eyebrow text-center text-[var(--color-ink-muted)] uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[7px]">
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />;
          const key = formatDateAsLocal(date);
          const future = date > today;
          const categories = completionMap.get(key) ?? EMPTY;
          const label = dayLabel(date, categories);
          return (
            <div
              key={key}
              className="relative"
              style={{ opacity: future ? 0.35 : 1 }}
            >
              <MosaicTile
                categories={categories}
                size={34}
                radius="var(--radius-tile-month)"
                title={label}
                focusable
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--color-ink)] mix-blend-luminosity">
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
