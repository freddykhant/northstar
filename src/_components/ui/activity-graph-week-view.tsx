"use client";

import { useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORIES = ["mind", "body", "soul"] as const;

interface WeekViewProps {
  completionMap: Map<string, { mind: number; body: number; soul: number }>;
  getCategoryColor: (category: string, completed: boolean) => string;
}

export function WeekView({ completionMap, getCategoryColor }: WeekViewProps) {
  const weekData = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      // use local date format (YYYY-MM-DD) to match completion data
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
