"use client";

import { useMemo } from "react";
import { getAllDaysInCurrentYear } from "~/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface YearViewProps {
  completionMap: Map<string, { mind: number; body: number; soul: number }>;
  getColor: (mind: number, body: number, soul: number) => string;
  hoveredDay: any;
  setHoveredDay: (day: any) => void;
}

export function YearView({
  completionMap,
  getColor,
  hoveredDay,
  setHoveredDay,
}: YearViewProps) {
  const days = useMemo(() => getAllDaysInCurrentYear(), []);

  const graphData = useMemo(() => {
    return days.map((dateStr) => {
      const dateObj = new Date(dateStr + "T00:00:00");
      const completion = completionMap.get(dateStr) ?? {
        mind: 0,
        body: 0,
        soul: 0,
      };
      return {
        date: dateObj,
        mind: completion.mind > 0 ? 1 : 0,
        body: completion.body > 0 ? 1 : 0,
        soul: completion.soul > 0 ? 1 : 0,
      };
    });
  }, [days, completionMap]);

  const weeks = useMemo(() => {
    const result: (typeof graphData)[] = [];
    let currentWeek: typeof graphData = [];

    const firstDayOfWeek = graphData[0]?.date.getDay() ?? 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0),
        mind: -1,
        body: -1,
        soul: -1,
      });
    }

    graphData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [graphData]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d.mind >= 0);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month] ?? "Jan", index: weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div>
      {/* Month labels */}
      <div className="relative mb-2 ml-8 h-4 text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
        {monthLabels.map(({ month, index }) => (
          <div
            key={`${month}-${index}`}
            className="absolute"
            style={{ left: `${index * 13 + 32}px` }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] pt-[1px] text-[10px] tracking-[0.04em] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
          {DAYS.map((day, i) => (
            <div key={day} className="flex h-[11px] items-center">
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>

        {/* Graph */}
        <div className="flex gap-[2px] overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day, dayIndex) => {
                const isValid = day.mind >= 0;
                return (
                  <div
                    key={dayIndex}
                    className="h-[11px] w-[11px] rounded-[2px]"
                    style={{
                      backgroundColor: getColor(day.mind, day.body, day.soul),
                    }}
                    onMouseEnter={(e) => {
                      if (isValid) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          ...day,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-3 text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
        <span>Less</span>
        <div className="flex gap-[2px]">
          {[0.08, 0.25, 0.45, 0.7, 0.9].map((a) => (
            <div
              key={a}
              className="h-[11px] w-[11px] rounded-[2px]"
              style={{ backgroundColor: `rgba(194, 65, 12, ${a})` }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
