"use client";

import { motion } from "framer-motion";

interface ScrollingBadgeProps {
  icon: string;
  label: string;
  targetId: string;
  color: "blue" | "red" | "purple";
}

const COLORS = {
  blue: {
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200 hover:border-blue-300",
    text: "text-blue-600",
  },
  red: {
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-200 hover:border-red-300",
    text: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200 hover:border-purple-300",
    text: "text-purple-600",
  },
};

export function ScrollingBadge({ icon, label, targetId, color }: ScrollingBadgeProps) {
  const styles = COLORS[color];

  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 transition-all ${styles.bg} ${styles.border}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-xl">{icon}</span>
      <span className={`text-sm font-semibold ${styles.text}`}>{label}</span>
    </motion.button>
  );
}
