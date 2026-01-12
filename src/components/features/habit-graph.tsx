/**
 * HabitGraph - Activity graph showing completions for the current year
 */

"use client";

import { useMemo } from "react";
import type { CategoryId, DayData } from "~/lib/types";
import { CATEGORY_COLORS, CATEGORY_EMOJIS, CATEGORY_LABELS, CATEGORY_IDS } from "~/lib/constants";
import { getAllDaysInCurrentYear, getCurrentYear } from "~/lib/utils";
import { GlassCard, GlassCardBody, GlassCardHeader } from "../ui/glass-card";

interface HabitGraphProps {
  completions: DayData[];
  todayDate: string;
}

export function HabitGraph({ completions, todayDate }: HabitGraphProps) {
  // Get all days in the current year (Jan 1 to Dec 31)
  const days = useMemo(() => getAllDaysInCurrentYear(), []);

  // Calculate month labels and positions for the x-axis
  const monthLabels = useMemo(() => {
    const labels: { month: string; startIndex: number }[] = [];
    let currentMonth = -1;

    days.forEach((date, index) => {
      const dateObj = new Date(date + "T00:00:00");
      const month = dateObj.getMonth();

      if (month !== currentMonth) {
        currentMonth = month;
        labels.push({
          month: dateObj.toLocaleDateString("en-US", { month: "short" }),
          startIndex: index,
        });
      }
    });

    return labels;
  }, [days]);

  // Create a map for quick lookup
  const completionMap = useMemo(() => {
    const map = new Map<string, DayData["categories"]>();
    completions.forEach((day) => {
      map.set(day.date, day.categories);
    });
    return map;
  }, [completions]);

  // Calculate total completions for insight
  const totalCompletions = useMemo(() => {
    let count = 0;
    completions.forEach((day) => {
      if (day.categories.mind) count++;
      if (day.categories.body) count++;
      if (day.categories.soul) count++;
    });
    return count;
  }, [completions]);

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1.5 text-xl font-bold text-white">Activity</h2>
            <p className="text-sm text-zinc-500">
              {getCurrentYear()} progress • {completions.length} days tracked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white transition-all duration-300">
              {totalCompletions}
            </div>
            <div className="text-xs font-medium text-zinc-500">completions</div>
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardBody>
        <div className="flex gap-6">
          {/* Category labels */}
          <div className="flex flex-col justify-around py-3">
            {CATEGORY_IDS.map((cat) => (
              <div
                key={cat}
                className="flex h-4 items-center gap-2.5 text-xs font-medium text-zinc-400"
              >
                <span className="text-base">{CATEGORY_EMOJIS[cat]}</span>
                <span className="capitalize">{CATEGORY_LABELS[cat]}</span>
              </div>
            ))}
          </div>

          {/* Graph grid */}
          <div className="flex-1 overflow-x-auto pb-1">
            {/* Month labels */}
            <div className="mb-3 flex gap-1">
              {monthLabels.map((label) => (
                <div
                  key={`month-${label.startIndex}`}
                  className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
                  style={{
                    marginLeft:
                      label.startIndex === 0 ? 0 : `${label.startIndex * 20}px`,
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>

            {/* Squares grid */}
            <div className="flex gap-1">
              {days.map((date) => {
                const dayData = completionMap.get(date);
                const isToday = date === todayDate;
                
                return (
                  <div key={date} className="flex flex-col gap-1">
                    {CATEGORY_IDS.map((cat) => {
                      const isComplete = dayData?.[cat] ?? false;
                      const colors = CATEGORY_COLORS[cat];

                      return (
                        <div
                          key={`${date}-${cat}`}
                          className={`h-4 w-4 rounded-sm border transition-all duration-300 hover:scale-125 hover:rounded-md ${
                            isComplete
                              ? `${colors.border} ${colors.bg} opacity-100 ${
                                  isToday
                                    ? `animate-pulse shadow-lg ${colors.shadow}`
                                    : `shadow-sm hover:shadow-md ${colors.shadowHover}`
                                }`
                              : "border-zinc-800 bg-zinc-800 opacity-30 hover:border-zinc-700 hover:opacity-50"
                          }`}
                          title={`${date} - ${CATEGORY_LABELS[cat]}: ${
                            isComplete ? "Completed" : "Not completed"
                          }`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCardBody>
    </GlassCard>
  );
}
