"use client";

import { useMemo } from "react";

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

interface MonthViewProps {
  completionMap: Map<string, { mind: number; body: number; soul: number }>;
  getColor: (mind: number, body: number, soul: number) => string;
  hoveredDay: any;
  setHoveredDay: (day: any) => void;
}

export function MonthView({
  completionMap,
  getColor,
  hoveredDay,
  setHoveredDay,
}: MonthViewProps) {
  const { weeks, currentMonth, currentYear, daysInMonth } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // create weeks array
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

    // pad start of first week
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0),
        day: -1,
        mind: -1,
        body: -1,
        soul: -1,
      });
    }

    // fill in days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // use local date format (YYYY-MM-DD) to match completion data
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

    // pad end of last week
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
      <div
        className="mb-4 font-serif text-[14px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
        style={{ fontOpticalSizing: "auto" }}
      >
        {MONTHS[currentMonth]} {currentYear}
      </div>

      {/* Day labels (horizontal header) */}
      <div className="mb-2 flex gap-[3px] pl-10">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex h-5 w-[36px] items-center justify-center text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]"
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Grid - weeks as rows, days as columns */}
      <div className="flex flex-col gap-[3px] overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex items-center gap-[3px]">
            <div className="w-8 text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
              W{weekIndex + 1}
            </div>

            {week.map((dayData, dayIndex) => {
              const isValid = dayData.day > 0;
              return (
                <div
                  key={dayIndex}
                  className={`relative flex h-[36px] w-[36px] items-center justify-center rounded-[4px] ${!isValid ? "opacity-0" : ""}`}
                  style={{
                    backgroundColor: isValid
                      ? getColor(dayData.mind, dayData.body, dayData.soul)
                      : "transparent",
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
                    <span className="tabular text-[11px] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
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
      <div className="mt-4 flex items-center gap-4 text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
        {(
          [
            ["mind", "#5b7a99"],
            ["body", "#b5553a"],
            ["soul", "#6f8a5e"],
          ] as const
        ).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
