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
  title?: string;
  onEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onLeave?: () => void;
}

export function MosaicTile({
  categories,
  size,
  radius,
  pulse = false,
  title,
  onEnter,
  onLeave,
}: MosaicTileProps) {
  const reduce = useReducedMotion();
  const perfect = isPerfectDay(categories);

  return (
    <motion.div
      title={title}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={reduce || !pulse ? {} : { scale: [1, 1.18, 1] }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
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
