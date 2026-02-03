"use client";

import { useMemo, useState } from "react";
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
const CATEGORIES = ["mind", "body", "soul"] as const;

type ViewMode = "month" | "week" | "year";

interface ActivityGraphProps {
  completions: DayData[];
}

export function ActivityGraph({ completions }: ActivityGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    mind: number;
    body: number;
    soul: number;
    x: number;
    y: number;
  } | null>(null);

  // Create completion map for quick lookup
  const completionMap = useMemo(() => {
    const map = new Map<string, { mind: number; body: number; soul: number }>();
    completions.forEach((completion) => {
      map.set(completion.date, {
        mind: completion.categories.mind ? 1 : 0,
        body: completion.categories.body ? 1 : 0,
        soul: completion.categories.soul ? 1 : 0,
      });
    });
    return map;
  }, [completions]);

  // Get color based on completion
  function getColor(mind: number, body: number, soul: number) {
    if (mind < 0) return "transparent";

    const total = mind + body + soul;
    if (total === 0) return "rgba(255,255,255,0.03)";

    const intensity = Math.min(total / 3, 1);
    const alpha = 0.3 + intensity * 0.7;

    if (mind > 0 && body === 0 && soul === 0) {
      return `rgba(59, 130, 246, ${alpha})`;
    }
    if (body > 0 && mind === 0 && soul === 0) {
      return `rgba(239, 68, 68, ${alpha})`;
    }
    if (soul > 0 && mind === 0 && body === 0) {
      return `rgba(168, 85, 247, ${alpha})`;
    }
    if (mind > 0 && body > 0 && soul === 0) {
      return `rgba(20, 184, 166, ${alpha})`;
    }
    if (mind > 0 && soul > 0 && body === 0) {
      return `rgba(99, 102, 241, ${alpha})`;
    }
    if (body > 0 && soul > 0 && mind === 0) {
      return `rgba(236, 72, 153, ${alpha})`;
    }
    return `rgba(255, 255, 255, ${alpha})`;
  }

  function getCategoryColor(category: string, completed: boolean) {
    if (!completed) return "rgba(255,255,255,0.03)";
    const alpha = 0.8;
    if (category === "mind") return `rgba(59, 130, 246, ${alpha})`;
    if (category === "body") return `rgba(239, 68, 68, ${alpha})`;
    if (category === "soul") return `rgba(168, 85, 247, ${alpha})`;
    return "rgba(255,255,255,0.03)";
  }

  return (
    <div className="relative rounded-xl border border-zinc-200 bg-white p-6 backdrop-blur-sm dark:border-white/6 dark:bg-white/3">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-black dark:text-white">
          Activity
        </h2>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/5">
          {[
            { id: "month", label: "Month" },
            { id: "week", label: "Week" },
            { id: "year", label: "Year" },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id as ViewMode)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === view.id
                  ? "bg-white text-black shadow-sm dark:bg-white/15 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "month" && (
        <MonthView
          completionMap={completionMap}
          getColor={getColor}
          hoveredDay={hoveredDay}
          setHoveredDay={setHoveredDay}
        />
      )}

      {viewMode === "week" && (
        <WeekView
          completionMap={completionMap}
          getCategoryColor={getCategoryColor}
        />
      )}

      {viewMode === "year" && (
        <YearView
          completionMap={completionMap}
          getColor={getColor}
          hoveredDay={hoveredDay}
          setHoveredDay={setHoveredDay}
        />
      )}

      {/* Tooltip */}
      {hoveredDay && viewMode !== "week" && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: hoveredDay.x,
            top: hoveredDay.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-xl dark:border-white/10 dark:bg-zinc-900">
            <p className="mb-1.5 text-xs font-medium text-black dark:text-white">
              {hoveredDay.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Mind:</span>
                <span className="text-black dark:text-white">
                  {hoveredDay.mind > 0 ? "Done" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Body:</span>
                <span className="text-black dark:text-white">
                  {hoveredDay.body > 0 ? "Done" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Soul:</span>
                <span className="text-black dark:text-white">
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

// Month View Component
function MonthView({
  completionMap,
  getColor,
  hoveredDay,
  setHoveredDay,
}: {
  completionMap: Map<string, { mind: number; body: number; soul: number }>;
  getColor: (mind: number, body: number, soul: number) => string;
  hoveredDay: any;
  setHoveredDay: (day: any) => void;
}) {
  const { weeks, currentMonth, currentYear, daysInMonth } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // Create weeks array
    const weeks: {
      date: Date;
      day: number;
      mind: number;
      body: number;
      soul: number;
    }[][] = [];
    let currentWeek: {
      date: Date;
      day: number;
      mind: number;
      body: number;
      soul: number;
    }[] = [];

    // Pad start of first week
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0),
        day: -1,
        mind: -1,
        body: -1,
        soul: -1,
      });
    }

    // Fill in days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use local date format (YYYY-MM-DD) to match completion data
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const completion = completionMap.get(dateStr) ?? {
        mind: 0,
        body: 0,
        soul: 0,
      };

      currentWeek.push({
        date,
        day,
        mind: completion.mind > 0 ? 1 : 0,
        body: completion.body > 0 ? 1 : 0,
        soul: completion.soul > 0 ? 1 : 0,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad end of last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          day: -1,
          mind: -1,
          body: -1,
          soul: -1,
        });
      }
      weeks.push(currentWeek);
    }

    return { weeks, currentMonth: month, currentYear: year, daysInMonth };
  }, [completionMap]);

  return (
    <div>
      <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {MONTHS[currentMonth]} {currentYear}
      </div>

      {/* Day labels (horizontal header) */}
      <div className="mb-2 flex gap-[3px] pl-10">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex h-6 w-[36px] items-center justify-center text-xs text-zinc-500"
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Grid - weeks as rows, days as columns */}
      <div className="flex flex-col gap-[3px] overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex items-center gap-[3px]">
            {/* Week label */}
            <div className="w-8 text-xs text-zinc-500">
              W{weekIndex + 1}
            </div>
            
            {/* Days in the week */}
            {week.map((dayData, dayIndex) => {
              const isValid = dayData.day > 0;
              const hasActivity =
                isValid &&
                (dayData.mind > 0 || dayData.body > 0 || dayData.soul > 0);

              return (
                <div
                  key={dayIndex}
                  className={`relative flex h-[36px] w-[36px] items-center justify-center rounded-lg transition-all duration-200 ${
                    hasActivity
                      ? "hover:scale-105 hover:ring-2 hover:ring-white/30"
                      : ""
                  } ${!isValid ? "opacity-0" : ""}`}
                  style={{
                    backgroundColor: isValid
                      ? getColor(dayData.mind, dayData.body, dayData.soul)
                      : "transparent",
                    boxShadow: hasActivity
                      ? `0 0 10px ${getColor(dayData.mind, dayData.body, dayData.soul)}`
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (isValid) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredDay({
                        date: dayData.date,
                        mind: dayData.mind,
                        body: dayData.body,
                        soul: dayData.soul,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {isValid && (
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {dayData.day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-500/80" />
          <span>Mind</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-red-500/80" />
          <span>Body</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-purple-500/80" />
          <span>Soul</span>
        </div>
      </div>
    </div>
  );
}

// Week View Component
function WeekView({
  completionMap,
  getCategoryColor,
}: {
  completionMap: Map<string, { mind: number; body: number; soul: number }>;
  getCategoryColor: (category: string, completed: boolean) => string;
}) {
  const weekData = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      // Use local date format (YYYY-MM-DD) to match completion data
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const completion = completionMap.get(dateStr) ?? {
        mind: 0,
        body: 0,
        soul: 0,
      };

      days.push({
        date,
        dayName: DAYS[i]!,
        dayNum: date.getDate(),
        isToday: date.toDateString() === now.toDateString(),
        mind: completion.mind > 0,
        body: completion.body > 0,
        soul: completion.soul > 0,
      });
    }

    return days;
  }, [completionMap]);

  const categoryLabels = [
    { id: "mind", label: "Mind", color: "bg-blue-500" },
    { id: "body", label: "Body", color: "bg-red-500" },
    { id: "soul", label: "Soul", color: "bg-purple-500" },
  ];

  return (
    <div>
      <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        This Week
      </div>

      <div className="flex gap-4">
        {/* Category labels */}
        <div className="flex flex-col gap-[6px] pt-[36px] text-xs text-zinc-500">
          {categoryLabels.map((cat) => (
            <div key={cat.id} className="flex h-[36px] items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
              <span>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-1 gap-[6px]">
          {weekData.map((day, dayIndex) => (
            <div key={dayIndex} className="flex flex-1 flex-col gap-[6px]">
              {/* Day header */}
              <div
                className={`flex h-[30px] flex-col items-center justify-center rounded-lg ${
                  day.isToday ? "bg-white/10 ring-1 ring-white/20" : ""
                }`}
              >
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  {day.dayName.slice(0, 3)}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    day.isToday
                      ? "text-white"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {day.dayNum}
                </span>
              </div>

              {/* Category cells */}
              {CATEGORIES.map((category) => {
                const completed = day[category];
                return (
                  <div
                    key={category}
                    className={`flex h-[36px] items-center justify-center rounded-lg transition-all duration-200 ${
                      completed ? "hover:scale-105" : ""
                    }`}
                    style={{
                      backgroundColor: getCategoryColor(category, completed),
                      boxShadow: completed
                        ? `0 0 12px ${getCategoryColor(category, completed)}`
                        : "none",
                    }}
                  >
                    {completed && (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
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

// Year View Component (existing implementation)
function YearView({
  completionMap,
  getColor,
  hoveredDay,
  setHoveredDay,
}: {
  completionMap: Map<string, { mind: number; body: number; soul: number }>;
  getColor: (mind: number, body: number, soul: number) => string;
  hoveredDay: any;
  setHoveredDay: (day: any) => void;
}) {
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
