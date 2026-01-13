"use client";

import { useState } from "react";

export function InteractiveActivityGraph() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Generate 52 weeks of demo data
  const weeks = 52;
  const daysPerWeek = 7;

  // Create semi-random pattern that looks good
  const getDayIntensity = (week: number, day: number): number => {
    const index = week * daysPerWeek + day;
    // Create a pattern with some gaps
    if (index % 11 === 0 || index % 13 === 0) return 0; // Empty days
    if (index % 3 === 0) return 3; // High intensity
    if (index % 2 === 0) return 2; // Medium intensity
    return 1; // Low intensity
  };

  const getColorForIntensity = (intensity: number, isHovered: boolean) => {
    if (intensity === 0) {
      return isHovered
        ? "bg-zinc-700 border-zinc-600"
        : "bg-zinc-800 border-zinc-800";
    }
    if (intensity === 1) {
      return isHovered
        ? "bg-blue-500/60 border-blue-400/50 shadow-md shadow-blue-500/30"
        : "bg-blue-500/40 border-blue-500/30";
    }
    if (intensity === 2) {
      return isHovered
        ? "bg-red-500/70 border-red-400/50 shadow-md shadow-red-500/30"
        : "bg-red-500/50 border-red-500/30";
    }
    return isHovered
      ? "bg-purple-500/80 border-purple-400/50 shadow-md shadow-purple-500/30"
      : "bg-purple-500/60 border-purple-500/30";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Your Year at a Glance</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Every square is a day. Watch your consistency grow.
        </p>
      </div>

      {/* Graph */}
      <div className="relative overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {Array.from({ length: weeks }, (_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: daysPerWeek }, (_, dayIndex) => {
                const dayNumber = weekIndex * daysPerWeek + dayIndex;
                const intensity = getDayIntensity(weekIndex, dayIndex);
                const isHovered = hoveredDay === dayNumber;

                return (
                  <div
                    key={dayIndex}
                    onMouseEnter={() => setHoveredDay(dayNumber)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-3 w-3 rounded-sm border transition-all duration-200 hover:scale-150 hover:rounded-md ${getColorForIntensity(
                      intensity,
                      isHovered,
                    )}`}
                    style={{
                      animationDelay: `${(weekIndex * daysPerWeek + dayIndex) * 2}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm border border-zinc-800 bg-zinc-800" />
            <div className="h-3 w-3 rounded-sm border border-blue-500/30 bg-blue-500/40" />
            <div className="h-3 w-3 rounded-sm border border-red-500/30 bg-red-500/50" />
            <div className="h-3 w-3 rounded-sm border border-purple-500/30 bg-purple-500/60" />
          </div>
          <span>More</span>
        </div>
        <div className="text-xs text-zinc-500">365 days tracked</div>
      </div>
    </div>
  );
}
