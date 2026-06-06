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
    { id: "mind", label: "Mind", color: "#5b7a99" },
    { id: "body", label: "Body", color: "#b5553a" },
    { id: "soul", label: "Soul", color: "#6f8a5e" },
  ];

  return (
    <div>
      <div
        className="mb-4 font-serif text-[14px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
        style={{ fontOpticalSizing: "auto" }}
      >
        This Week
      </div>

      <div className="flex gap-4">
        {/* Category labels */}
        <div className="flex flex-col gap-[6px] pt-[36px] text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
          {categoryLabels.map((cat) => (
            <div key={cat.id} className="flex h-[36px] items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
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
                className={`flex h-[30px] flex-col items-center justify-center rounded-[4px] ${
                  day.isToday ? "bg-black/6 dark:bg-white/8" : ""
                }`}
              >
                <span className="text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
                  {day.dayName.slice(0, 3)}
                </span>
                <span className="tabular text-[11px] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                  {day.dayNum}
                </span>
              </div>

              {/* Category cells */}
              {CATEGORIES.map((category) => {
                const completed = day[category];
                return (
                  <div
                    key={category}
                    className="flex h-[36px] items-center justify-center rounded-[4px]"
                    style={{
                      backgroundColor: getCategoryColor(category, completed),
                    }}
                  >
                    {completed && (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#fbf9f3"
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
