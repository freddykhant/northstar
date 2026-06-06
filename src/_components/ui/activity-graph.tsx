"use client";

import { useMemo, useState } from "react";
import { CATEGORY_HEX } from "~/lib/constants";
import type { DayData } from "~/lib/types";
import { MonthView } from "./activity-graph-month-view";
import { WeekView } from "./activity-graph-week-view";
import { YearView } from "./activity-graph-year-view";

type ViewMode = "month" | "week" | "year";

interface ActivityGraphProps {
  completions: DayData[];
}

// Earthy ramps mirroring CATEGORY_HEX, used for the graph cells.
const RGB = {
  mind: [91, 122, 153] as const, // slate-blue
  body: [181, 85, 58] as const, // terracotta
  soul: [111, 138, 94] as const, // sage
  ember: [194, 65, 12] as const, // perfect-day
};

function mix(...tuples: (readonly [number, number, number])[]) {
  const n = tuples.length;
  const r = Math.round(tuples.reduce((s, t) => s + t[0], 0) / n);
  const g = Math.round(tuples.reduce((s, t) => s + t[1], 0) / n);
  const b = Math.round(tuples.reduce((s, t) => s + t[2], 0) / n);
  return [r, g, b] as const;
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

  function getColor(mind: number, body: number, soul: number) {
    if (mind < 0) return "transparent";

    const total = mind + body + soul;
    if (total === 0) return "color-mix(in srgb, var(--color-ink) 6%, transparent)";

    const intensity = Math.min(total / 3, 1);
    const alpha = 0.35 + intensity * 0.55;

    let rgb: readonly [number, number, number];
    if (mind > 0 && body === 0 && soul === 0) rgb = RGB.mind;
    else if (body > 0 && mind === 0 && soul === 0) rgb = RGB.body;
    else if (soul > 0 && mind === 0 && body === 0) rgb = RGB.soul;
    else if (mind > 0 && body > 0 && soul === 0) rgb = mix(RGB.mind, RGB.body);
    else if (mind > 0 && soul > 0 && body === 0) rgb = mix(RGB.mind, RGB.soul);
    else if (body > 0 && soul > 0 && mind === 0) rgb = mix(RGB.body, RGB.soul);
    else rgb = RGB.ember; // all three — perfect day

    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  }

  function getCategoryColor(category: string, completed: boolean) {
    if (!completed)
      return "color-mix(in srgb, var(--color-ink) 6%, transparent)";
    const rgb =
      category === "mind"
        ? RGB.mind
        : category === "body"
          ? RGB.body
          : category === "soul"
            ? RGB.soul
            : RGB.ember;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.85)`;
  }

  return (
    <div className="relative rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-6 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="font-serif text-[20px] leading-none font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
          style={{ fontOpticalSizing: "auto" }}
        >
          Activity
        </h2>

        <div className="flex items-center gap-0 rounded-[6px] border border-black/8 p-[2px] dark:border-white/8">
          {[
            { id: "year", label: "Year" },
            { id: "month", label: "Month" },
            { id: "week", label: "Week" },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id as ViewMode)}
              className={`rounded-[4px] px-3 py-1 text-[11px] tracking-[0.04em] ${
                viewMode === view.id
                  ? "bg-black/6 text-[var(--color-ink)] dark:bg-white/8 dark:text-[var(--color-ink-dark)]"
                  : "text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
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

      {completions.length === 0 && (
        <p className="mt-4 text-center font-serif text-[13px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
          No activity yet — start checking off habits to see your lawn grow.
        </p>
      )}

      {hoveredDay && viewMode !== "week" && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: hoveredDay.x,
            top: hoveredDay.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="rounded-[8px] border border-black/8 bg-[var(--color-paper-raised)] px-3 py-2 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
            <p className="mb-1.5 text-[11px] tracking-[0.04em] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
              {hoveredDay.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <div className="flex flex-col gap-1 text-[11px]">
              {(["mind", "body", "soul"] as const).map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_HEX[cat] }}
                  />
                  <span className="text-[var(--color-ink-muted)] capitalize dark:text-[var(--color-ink-dark-muted)]">
                    {cat}
                  </span>
                  <span className="text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                    {hoveredDay[cat] > 0 ? "Done" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
