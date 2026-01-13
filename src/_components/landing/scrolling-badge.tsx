"use client";

import { motion } from "framer-motion";
import { Brain, Dumbbell, Sparkles } from "lucide-react";

interface ScrollingBadgeProps {
  icon: "mind" | "body" | "soul";
  label: string;
  targetId: string;
  color: "blue" | "red" | "purple";
}

const ICONS = {
  mind: Brain,
  body: Dumbbell,
  soul: Sparkles,
};

const ICON_COLORS = {
  blue: "text-blue-500",
  red: "text-red-500",
  purple: "text-purple-500",
};

const TEXT_GRADIENTS = {
  blue: "from-blue-400 via-cyan-400 to-blue-600",
  red: "from-red-400 via-orange-400 to-red-600",
  purple: "from-purple-400 via-pink-400 to-purple-600",
};

export function ScrollingBadge({
  icon,
  label,
  targetId,
  color,
}: ScrollingBadgeProps) {
  const Icon = ICONS[icon];
  const iconColor = ICON_COLORS[color];
  const textGradient = TEXT_GRADIENTS[color];

  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="group inline-flex cursor-pointer items-center gap-2 px-4 py-2 transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon */}
      <Icon
        className={`h-5 w-5 ${iconColor} transition-transform group-hover:scale-110`}
      />

      {/* Animated gradient text */}
      <span
        className={`animate-shimmer bg-gradient-to-r ${textGradient} bg-[length:200%_100%] bg-clip-text text-sm font-semibold text-transparent`}
      >
        {label}
      </span>
    </motion.button>
  );
}
