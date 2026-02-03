"use client";

import { useMemo, useState } from "react";
import type { DayData } from "~/lib/types";
import { MonthView } from "./activity-graph-month-view";
import { WeekView } from "./activity-graph-week-view";
import { YearView } from "./activity-graph-year-view";

type ViewMode = "month" | "week" | "year";

interface ActivityGraphProps {
  completions: DayData[];
}

export function ActivityGraph({ completions }: ActivityGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("year");
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
    // All three = Gold/Amber for "perfect day"
    return `rgba(251, 191, 36, ${alpha})`;
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
            { id: "year", label: "Year" },
            { id: "month", label: "Month" },
            { id: "week", label: "Week" },
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
