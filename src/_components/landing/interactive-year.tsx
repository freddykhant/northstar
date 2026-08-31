"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { MosaicTile } from "~/_components/ui/mosaic";
import { SegmentedControl } from "~/_components/ui/primitives";
import { CATEGORY_LABELS } from "~/lib/constants";
import { becamePerfect, toggleCategory } from "~/lib/landing-interaction";
import {
  buildDemoYear,
  HERO_DAYS,
  HERO_WEEKS,
  parseDayKey,
} from "~/lib/landing-seed";
import { dayLabel, tileBackground } from "~/lib/mosaic";
import type { CategoryId, DayCategories } from "~/lib/types";
import { formatDateAsLocal } from "~/lib/utils";

const TILE = 18;
const GAP = 6;
const ROWS = 7;

/** Where the ink comes from, in px relative to the tile it lands on. Squii's
 *  panel sits below-left of the mosaic on mobile and left of it from `sm:` up,
 *  so a single down-and-left origin reads as "from him" in both layouts. The
 *  puff is deliberately a short local gesture rather than a measured flight
 *  across the two panels: a 140ms travel over several hundred px would read as
 *  a glitch, and cross-component coordinates would need re-measuring on every
 *  scroll and resize. */
const INK_ORIGIN = { x: -22, y: 12 };

/** The exact control points of `--ease-squish` in globals.css. Framer takes a
 *  bezier array, not a CSS custom property, so the token cannot be referenced
 *  here — keep these two in sync. */
const INK_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/** Seconds. 140ms, per the brand's motion spec. */
const INK_DURATION = 0.14;

/** One category on, the other two off — so the puff borrows its colour from
 *  `tileBackground`, the same function that paints the tile, and can never
 *  drift from the category hues. */
function onlyCategory(id: CategoryId): DayCategories {
  return { mind: id === "mind", body: id === "body", soul: id === "soul" };
}

interface InkPuff {
  /** The day key the puff lands on. */
  key: string;
  category: CategoryId;
  /** Monotonic, so marking the same tile twice remounts and replays the
   *  animation instead of reconciling into a finished one. */
  id: number;
}

const OPTIONS: { id: CategoryId; label: string }[] = [
  { id: "mind", label: CATEGORY_LABELS.mind },
  { id: "body", label: CATEGORY_LABELS.body },
  { id: "soul", label: CATEGORY_LABELS.soul },
];

interface InteractiveYearProps {
  /** The reference day as a `YYYY-MM-DD` key, resolved once on the server.
   *
   *  Deliberately a string, not a Date. A Date crosses the RSC boundary as an
   *  instant, and server and client would each re-read it with local
   *  getFullYear/getMonth/getDate — so whenever the two zones disagree, every
   *  tile shifts by a day and the entire subtree fails to hydrate. A key has
   *  no zone: `parseDayKey` yields the same calendar fields on both sides.
   *  Never call new Date() in here. */
  referenceKey: string;
}

const GRID_HINT_ID = "demo-mosaic-hint";

export function InteractiveYear({ referenceKey }: InteractiveYearProps) {
  const referenceDate = useMemo(
    () => parseDayKey(referenceKey),
    [referenceKey],
  );
  const [category, setCategory] = useState<CategoryId>("mind");
  const [days, setDays] = useState<Map<string, DayCategories>>(() =>
    buildDemoYear(referenceDate, HERO_DAYS),
  );
  const [pulseKey, setPulseKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const [puff, setPuff] = useState<InkPuff | null>(null);
  const puffId = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Column-major: index i is week floor(i / 7), weekday i % 7. Oldest first,
  // so the last column is the reference date's week.
  const dates = useMemo(() => {
    const out: Date[] = [];
    for (let i = HERO_DAYS - 1; i >= 0; i--) {
      out.push(
        new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth(),
          referenceDate.getDate() - i,
        ),
      );
    }
    return out;
  }, [referenceDate]);

  // Computed outside a state updater deliberately. Updater functions must be
  // pure — React runs them twice in StrictMode, so calling setPulseKey and
  // setAnnouncement inside one would double-fire the live region.
  const handleToggle = useCallback(
    (key: string, date: Date) => {
      const after = toggleCategory(days, key, category);
      setPulseKey(becamePerfect(days, after, key) ? key : null);
      setAnnouncement(dayLabel(date, after.get(key)!));
      // The colour change is INFORMATION — it is the answer to "did my click
      // register" — so it is applied unconditionally, never behind a motion
      // gate. The puff below is decoration and is the only thing reduced
      // motion drops.
      setDays(after);

      const marked = after.get(key)![category];
      setPuff(
        marked && !reduce ? { key, category, id: ++puffId.current } : null,
      );
    },
    [days, category, reduce],
  );

  const moveFocus = useCallback((from: number, delta: number) => {
    const next = Math.min(Math.max(from + delta, 0), HERO_DAYS - 1);
    setFocusIndex(next);
    const el =
      gridRef.current?.querySelectorAll<HTMLButtonElement>("button")[next];
    el?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const map: Record<string, number> = {
        ArrowUp: -1,
        ArrowDown: 1,
        ArrowLeft: -ROWS,
        ArrowRight: ROWS,
      };
      const delta = map[e.key];
      if (delta === undefined) return;
      e.preventDefault();
      moveFocus(index, delta);
    },
    [moveFocus],
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <SegmentedControl
        options={OPTIONS}
        value={category}
        onChange={setCategory}
      />

      <div
        ref={gridRef}
        role="group"
        aria-label="Demo mosaic, last 20 weeks"
        aria-describedby={GRID_HINT_ID}
        className="grid grid-flow-col overflow-x-auto"
        style={{
          gridTemplateRows: `repeat(${ROWS}, ${TILE}px)`,
          gridTemplateColumns: `repeat(${HERO_WEEKS}, ${TILE}px)`,
          gap: GAP,
        }}
      >
        {dates.map((date, index) => {
          const key = formatDateAsLocal(date);
          const value = days.get(key) ?? {
            mind: false,
            body: false,
            soul: false,
          };
          return (
            <button
              key={key}
              type="button"
              aria-pressed={value[category]}
              aria-label={dayLabel(date, value)}
              tabIndex={index === focusIndex ? 0 : -1}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onClick={() => handleToggle(key, date)}
              className="relative rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              <MosaicTile
                categories={value}
                background={tileBackground(value)}
                size={TILE}
                radius="var(--radius-tile-month)"
                pulse={pulseKey === key}
                focusable={false}
              />
              {/* Squii's ink. Purely decorative: the live region below already
                  announces what changed, so this is aria-hidden and never a
                  tab stop or pointer target. */}
              {puff?.key === key && (
                <motion.span
                  key={puff.id}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[4px]"
                  initial={{
                    opacity: 0.9,
                    scale: 0.35,
                    x: INK_ORIGIN.x,
                    y: INK_ORIGIN.y,
                  }}
                  animate={{ opacity: 0, scale: 1.45, x: 0, y: 0 }}
                  transition={{
                    duration: INK_DURATION,
                    ease: INK_EASE,
                  }}
                  onAnimationComplete={() =>
                    setPuff((current) =>
                      current?.id === puff.id ? null : current,
                    )
                  }
                  style={{
                    background: tileBackground(onlyCategory(puff.category)),
                    filter: "blur(1.5px)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <p
        id={GRID_HINT_ID}
        className="text-[12px] text-[var(--color-ink-muted)]"
      >
        Pick a category, then click a day. Three in one day turns it gold.
      </p>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
