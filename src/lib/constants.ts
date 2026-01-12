/**
 * Application-wide constants
 */

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

export const CATEGORY_COLORS = {
  mind: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    card: "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5",
    cardHover: "hover:border-blue-500/30",
    glow: "bg-blue-500/20",
    text: "text-blue-300",
    bg: "bg-blue-500",
    border: "border-blue-500/50",
    shadow: "shadow-blue-500/50",
    shadowHover: "hover:shadow-blue-500/30",
  },
  body: {
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    card: "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5",
    cardHover: "hover:border-red-500/30",
    glow: "bg-red-500/20",
    text: "text-red-300",
    bg: "bg-red-500",
    border: "border-red-500/50",
    shadow: "shadow-red-500/50",
    shadowHover: "hover:shadow-red-500/30",
  },
  soul: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    card: "border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5",
    cardHover: "hover:border-purple-500/30",
    glow: "bg-purple-500/20",
    text: "text-purple-300",
    bg: "bg-purple-500",
    border: "border-purple-500/50",
    shadow: "shadow-purple-500/50",
    shadowHover: "hover:shadow-purple-500/30",
  },
} as const;
