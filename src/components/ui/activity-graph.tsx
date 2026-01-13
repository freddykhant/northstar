"use client";

import { useState, useMemo } from "react";
import type { DayData } from "~/lib/types";
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

interface ActivityGraphProps {
  completions: DayData[];
  todayDate: string;
}

export function ActivityGraph({ completions, todayDate }: ActivityGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    mind: number;
    body: number;
    soul: number;
    x: number;
    y: number;
  } | null>(null);

  // Get all days in the current year
  const days = useMemo(() => getAllDaysInCurrentYear(), []);

  // Create completion map for quick lookup
  const completionMap = useMemo(() => {
    const map = new Map<string, { mind: number; body: number; soul: number }>();
    completions.forEach((completion) => {
      map.set(completion.date, {
        mind: completion.categories.mind || 0,
        body: completion.categories.body || 0,
        soul: completion.categories.soul || 0,
      });
    });
    return map;
  }, [completions]);

  // Transform data for the graph
  const graphData = useMemo(() => {
    return days.map((dateStr) => {
      const dateObj = new Date(dateStr + "T00:00:00");
      const completion = completionMap.get(dateStr) || {
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

  // Group data by weeks
  const weeks = useMemo(() => {
    const result: (typeof graphData)[] = [];
    let currentWeek: typeof graphData = [];

    // Pad the first week with empty days
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

  // Get month labels
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

  // Get color based on completion
  function getColor(mind: number, body: number, soul: number) {
    if (mind < 0) return "transparent";

    const total = mind + body + soul;
    if (total === 0) return "rgba(255,255,255,0.03)";

    // Calculate intensity based on total (0-3 possible)
    const intensity = Math.min(total / 3, 1);
    const alpha = 0.3 + intensity * 0.7;

    // If only one category, use its pure color
    if (mind > 0 && body === 0 && soul === 0) {
      return `rgba(59, 130, 246, ${alpha})`; // Blue
    }
    if (body > 0 && mind === 0 && soul === 0) {
      return `rgba(239, 68, 68, ${alpha})`; // Red
    }
    if (soul > 0 && mind === 0 && body === 0) {
      return `rgba(168, 85, 247, ${alpha})`; // Purple
    }

    // Blend colors for multiple categories
    // Mind + Body = Cyan/Teal
    if (mind > 0 && body > 0 && soul === 0) {
      return `rgba(20, 184, 166, ${alpha})`; // Teal
    }
    // Mind + Soul = Indigo
    if (mind > 0 && soul > 0 && body === 0) {
      return `rgba(99, 102, 241, ${alpha})`; // Indigo
    }
    // Body + Soul = Pink
    if (body > 0 && soul > 0 && mind === 0) {
      return `rgba(236, 72, 153, ${alpha})`; // Pink
    }

    // All three = White/full spectrum
    return `rgba(255, 255, 255, ${alpha})`;
  }

  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Activity</h2>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-white/[0.03]" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.15]" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.3]" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.5]" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.7]" />
          </div>
          <span>More</span>
        </div>
      </div>

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

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: hoveredDay.x,
            top: hoveredDay.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 shadow-xl">
            <p className="mb-1.5 text-xs font-medium text-white">
              {hoveredDay.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-zinc-400">Mind:</span>
                <span className="text-white">
                  {hoveredDay.mind > 0 ? "Done" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-zinc-400">Body:</span>
                <span className="text-white">
                  {hoveredDay.body > 0 ? "Done" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-zinc-400">Soul:</span>
                <span className="text-white">
                  {hoveredDay.soul > 0 ? "Done" : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
