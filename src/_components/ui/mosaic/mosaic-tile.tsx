"use client";

import { motion, useReducedMotion } from "framer-motion";
import { isPerfectDay, tileBackground, type DayCategories } from "~/lib/mosaic";

interface MosaicTileProps {
  categories: DayCategories;
  /** px; the tile is square */
  size: number;
  /** Any valid CSS `border-radius` value, e.g. `8` (px) or `"var(--radius-tile-month)"`. */
  radius: number | string;
  /** Pulse once — used when today's tile gains a band. */
  pulse?: boolean;
  /** Human-readable description, e.g. "Sat 9 Aug — Mind, Soul". Used as the native
   *  hover tooltip and, when `focusable`, as the accessible name. */
  title?: string;
  /** Whether this tile represents a real day and should be a tab stop. Tiles that
   *  only hold grid position (out-of-range padding) must stay out of the tab order. */
  focusable?: boolean;
  onShow?: (e: React.SyntheticEvent<HTMLElement>) => void;
  onHide?: () => void;
}

export function MosaicTile({
  categories,
  size,
  radius,
  pulse = false,
  title,
  focusable = false,
  onShow,
  onHide,
}: MosaicTileProps) {
  const reduce = useReducedMotion();
  const perfect = isPerfectDay(categories);

  return (
    <motion.div
      title={title}
      tabIndex={focusable ? 0 : undefined}
      aria-label={focusable ? title : undefined}
      onMouseEnter={onShow}
      onMouseLeave={onHide}
      onFocus={focusable ? onShow : undefined}
      onBlur={focusable ? onHide : undefined}
      animate={reduce || !pulse ? {} : { scale: [1, 1.18, 1] }}
      transition={{ type: "tween", duration: 0.42, times: [0, 0.4, 1], ease: "easeOut" }}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: tileBackground(categories),
        boxShadow: perfect
          ? "0 0 0 1.5px var(--color-canvas), 0 0 0 2.5px color-mix(in srgb, var(--color-ink) 30%, transparent)"
          : undefined,
      }}
    />
  );
}
