// application-wide constants

import type { CategoryId } from "./types";

export const CATEGORY_IDS = ["mind", "body", "soul"] as const;

export const CATEGORY_EMOJIS: Record<CategoryId, string> = {
  mind: "🧠",
  body: "💪",
  soul: "✨",
} as const;

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  mind: "Mind",
  body: "Body",
  soul: "Soul",
} as const;

// Muted earthy tokens — slate-blue / terracotta / sage
// Hex values mirror the CSS vars in globals.css so they can be used inline.
// Per-theme category hexes, mirroring the CSS vars in globals.css. Needed only
// where a real hex is required (canvas, image export); prefer var(--color-mind)
// in markup so theme switching is automatic.
export const CATEGORY_HEX_LIGHT: Record<CategoryId, string> = {
  mind: "#6c5ce7",
  body: "#f2542d",
  soul: "#0fa47f",
} as const;

export const CATEGORY_HEX_DARK: Record<CategoryId, string> = {
  mind: "#9c8fff",
  body: "#ff7d5c",
  soul: "#35c9a3",
} as const;

/** @deprecated Use CATEGORY_HEX_LIGHT/DARK or var(--color-<id>). */
export const CATEGORY_HEX = CATEGORY_HEX_LIGHT;

export const CATEGORY_DESCRIPTIONS: Record<CategoryId, string> = {
  mind: "Mental & intellectual growth",
  body: "Physical health & fitness",
  soul: "Emotional & spiritual wellbeing",
} as const;
