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

// Legacy shape kept for compatibility with feature components not yet on the
// new tokens (habit-graph, etc.). New code should read CATEGORY_HEX instead.
export const CATEGORY_COLORS = {
  mind: {
    badge:
      "bg-[color-mix(in_srgb,var(--color-mind)_14%,transparent)] text-[var(--color-mind)] border-[color-mix(in_srgb,var(--color-mind)_30%,transparent)]",
    card: "border-black/8 dark:border-white/8 bg-[var(--color-paper-raised)] dark:bg-[var(--color-paper-dark-raised)]",
    cardHover: "hover:border-black/16 dark:hover:border-white/16",
    glow: "bg-transparent",
    text: "text-[var(--color-mind)]",
    bg: "bg-[var(--color-mind)]",
    border: "border-[var(--color-mind)]",
    shadow: "",
    shadowHover: "",
  },
  body: {
    badge:
      "bg-[color-mix(in_srgb,var(--color-body)_14%,transparent)] text-[var(--color-body)] border-[color-mix(in_srgb,var(--color-body)_30%,transparent)]",
    card: "border-black/8 dark:border-white/8 bg-[var(--color-paper-raised)] dark:bg-[var(--color-paper-dark-raised)]",
    cardHover: "hover:border-black/16 dark:hover:border-white/16",
    glow: "bg-transparent",
    text: "text-[var(--color-body)]",
    bg: "bg-[var(--color-body)]",
    border: "border-[var(--color-body)]",
    shadow: "",
    shadowHover: "",
  },
  soul: {
    badge:
      "bg-[color-mix(in_srgb,var(--color-soul)_14%,transparent)] text-[var(--color-soul)] border-[color-mix(in_srgb,var(--color-soul)_30%,transparent)]",
    card: "border-black/8 dark:border-white/8 bg-[var(--color-paper-raised)] dark:bg-[var(--color-paper-dark-raised)]",
    cardHover: "hover:border-black/16 dark:hover:border-white/16",
    glow: "bg-transparent",
    text: "text-[var(--color-soul)]",
    bg: "bg-[var(--color-soul)]",
    border: "border-[var(--color-soul)]",
    shadow: "",
    shadowHover: "",
  },
} as const;
