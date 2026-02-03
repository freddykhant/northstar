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
      <div className="mb-2 ml-8 flex text-xs text-zinc-500">
        {monthLabels.map(({ month, index }) => (
          <div
            key={`${month}-${index}`}
            className="absolute"
            style={{ left: `${index * 14 + 32}px` }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-6">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pt-[2px] text-xs text-zinc-500">
          {DAYS.map((day, i) => (
            <div key={day} className="flex h-[12px] items-center">
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>

        {/* Graph */}
        <div className="flex gap-[3px] overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => {
                const isValid = day.mind >= 0;
                const hasActivity =
                  isValid && (day.mind > 0 || day.body > 0 || day.soul > 0);

                return (
                  <div
                    key={dayIndex}
                    className={`h-[12px] w-[12px] rounded-sm transition-all duration-200 ${
                      hasActivity
                        ? "hover:scale-110 hover:ring-2 hover:ring-white/30"
                        : ""
                    }`}
                    style={{
                      backgroundColor: getColor(day.mind, day.body, day.soul),
                      boxShadow: hasActivity
                        ? `0 0 8px ${getColor(day.mind, day.body, day.soul)}`
                        : "none",
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
      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-white/3" />
          <div className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-white/15" />
          <div className="h-3 w-3 rounded-sm bg-zinc-300 dark:bg-white/30" />
          <div className="h-3 w-3 rounded-sm bg-zinc-400 dark:bg-white/50" />
          <div className="h-3 w-3 rounded-sm bg-zinc-500 dark:bg-white/70" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
