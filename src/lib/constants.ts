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
export const CATEGORY_HEX: Record<CategoryId, string> = {
  mind: "#5b7a99",
  body: "#b5553a",
  soul: "#6f8a5e",
} as const;

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
