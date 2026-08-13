"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";
import { formatDay, type DayCategories } from "~/lib/mosaic";
import type { DayData } from "~/lib/types";
import { Card, SegmentedControl } from "../primitives";
import { MosaicLegend } from "./mosaic-legend";
import { MosaicMonth } from "./mosaic-month";
import { MosaicWeek } from "./mosaic-week";
import { MosaicYear } from "./mosaic-year";

type ViewMode = "year" | "month" | "week";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "year", label: "Year" },
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
];

interface MosaicProps {
  completions: DayData[];
  todayKey?: string;
  pulseToday?: boolean;
  isLoading?: boolean;
}

interface Hovered {
  date: Date;
  categories: DayCategories;
  /** Anchor point for the tooltip, in viewport coordinates (fixed positioning). */
  x: number;
  y: number;
}

export function Mosaic({
  completions,
  todayKey,
  pulseToday,
  isLoading,
}: MosaicProps) {
  const [view, setView] = useState<ViewMode>("year");
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const completionMap = useMemo(() => {
    const map = new Map<string, DayCategories>();
    for (const c of completions) map.set(c.date, c.categories);
    return map;
  }, [completions]);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-title text-[var(--color-ink)]">Your year</h2>

        <SegmentedControl
          options={VIEWS}
          value={view}
          onChange={(v) => {
            setView(v);
            setHovered(null);
          }}
        />
      </div>

      {view === "year" && (
        <MosaicYear
          completionMap={completionMap}
          todayKey={todayKey}
          pulseToday={pulseToday}
          onShow={(date, categories, e) => {
            // Anchor from the tile's own box rather than clientX/clientY so this works
            // for focus events (keyboard/screen-reader), not just mouse events.
            const rect = e.currentTarget.getBoundingClientRect();
            setHovered({
              date,
              categories,
              x: rect.left + rect.width / 2,
              y: rect.top,
            });
          }}
          onHide={() => setHovered(null)}
        />
      )}
      {view === "month" && <MosaicMonth completionMap={completionMap} />}
      {view === "week" && <MosaicWeek completionMap={completionMap} />}

      <div className="mt-4 border-t border-[var(--color-hairline)] pt-4">
        <MosaicLegend view={view} />
      </div>

      {completions.length === 0 && !isLoading && (
        <p className="mt-4 text-[13px] text-[var(--color-ink-muted)]">
          Nothing marked yet. Check off a habit and today lights up.
        </p>
      )}

      {mounted &&
        hovered &&
        view === "year" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50"
            style={{
              left: hovered.x,
              top: hovered.y - 10,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="rounded-[var(--radius-control)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-lift)]">
              <p className="mb-1.5 text-[12px] font-bold text-[var(--color-ink)]">
                {formatDay(hovered.date)}
              </p>
              <div className="flex flex-col gap-1">
                {CATEGORY_IDS.map((id) => (
                  <div key={id} className="flex items-center gap-2 text-[11px]">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: `var(--color-${id})` }}
                    />
                    <span className="text-[var(--color-ink-muted)]">
                      {CATEGORY_LABELS[id]}
                    </span>
                    <span className="ml-auto font-semibold text-[var(--color-ink)]">
                      {hovered.categories[id] ? "Kept" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Card>
  );
}
