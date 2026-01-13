"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORY_EMOJIS } from "~/lib/constants";
import type { CategoryId, HabitWithStatus } from "~/lib/types";
import { Confetti } from "./confetti";

interface CheckinListProps {
  habits: HabitWithStatus[];
  onToggle: (habitId: number) => void;
  justCompleted: Set<number>;
  isLoading: boolean;
}

const categoryConfig = {
  mind: {
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
    glowColor: "shadow-blue-500/30",
    ringColor: "ring-blue-500/50",
  },
  body: {
    color: "bg-red-500",
    borderColor: "border-red-500",
    textColor: "text-red-400",
    glowColor: "shadow-red-500/30",
    ringColor: "ring-red-500/50",
  },
  soul: {
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    textColor: "text-purple-400",
    glowColor: "shadow-purple-500/30",
    ringColor: "ring-purple-500/50",
  },
} as const;

export function CheckinList({
  habits,
  onToggle,
  justCompleted,
  isLoading,
}: CheckinListProps) {
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progress = (completedCount / totalCount) * 100;
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(completedCount);

  // Trigger confetti when all habits are completed
  useEffect(() => {
    if (
      completedCount === totalCount &&
      totalCount > 0 &&
      completedCount > prevCompletedCount
    ) {
      setShouldCelebrate(true);
      setTimeout(() => setShouldCelebrate(false), 100);
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, totalCount, prevCompletedCount]);

  return (
    <div className="space-y-6">
      <Confetti trigger={shouldCelebrate} />

      {/* Enhanced Progress Ring */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-linear-to-br from-white to-zinc-50/50 p-4 shadow-sm dark:border-white/10 dark:from-zinc-900/50 dark:to-zinc-900/30">
          {/* Circular Progress */}
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-full w-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-zinc-200 dark:text-white/10"
              />
              {/* Progress circle */}
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 176 - (176 * progress) / 100 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ strokeDasharray: 176 }}
              />
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-lg font-bold text-black dark:text-white"
                key={completedCount}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                {completedCount}
              </motion.span>
            </div>
          </div>

          {/* Progress Info */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-black dark:text-white">
                Today's Focus
              </span>
              {completedCount === totalCount && totalCount > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                >
                  <Zap className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {completedCount} of {totalCount} completed
              </span>
              {completedCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-zinc-500"
                >
                  • {Math.round(progress)}%
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Habit toggles */}
      <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {habits.map((habit, index) => {
            const categoryId = habit.category.id as CategoryId;
            const config = categoryConfig[categoryId];
            const isCompleted = habit.isCompleted;
            const isAnimating = justCompleted.has(habit.id);

            return (
              <motion.button
                key={habit.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: index * 0.05,
                  layout: { type: "spring", bounce: 0.3, duration: 0.6 },
                }}
                onClick={() => onToggle(habit.id)}
                disabled={isLoading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex w-full items-center gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                  isCompleted
                    ? `border-zinc-300 bg-linear-to-br from-zinc-100 to-white shadow-md ${config.glowColor} dark:border-white/12 dark:from-white/8 dark:to-white/5`
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-white/6 dark:bg-white/3 dark:hover:border-white/10 dark:hover:bg-white/5"
                }`}
              >
                {/* Enhanced Checkbox */}
                <motion.div
                  className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                    isCompleted
                      ? `${config.color} ring-2 ${config.ringColor} shadow-lg`
                      : `border-2 border-zinc-300 bg-white group-hover:${config.borderColor} group-hover:scale-110 dark:border-zinc-600 dark:bg-zinc-800`
                  }`}
                  animate={
                    isCompleted
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <AnimatePresence>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", bounce: 0.6 }}
                      >
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ripple effect on complete */}
                  {isAnimating && (
                    <motion.div
                      className={`absolute inset-0 rounded-lg ${config.color} opacity-50`}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </motion.div>

                {/* Enhanced Icon */}
                <motion.div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                    isCompleted
                      ? `${config.color}/10 ${config.textColor} shadow-sm`
                      : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-500"
                  }`}
                  animate={
                    isCompleted ? { rotate: [0, -10, 10, -5, 5, 0] } : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-lg">{CATEGORY_EMOJIS[categoryId]}</span>
                </motion.div>

                {/* Enhanced Label */}
                <div className="min-w-0 flex-1 text-left">
                  <motion.span
                    className={`block text-sm font-medium transition-all duration-300 ${
                      isCompleted
                        ? "text-black dark:text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    layout
                  >
                    {habit.name}
                  </motion.span>
                  {habit.description && (
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Completion Badge */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`flex items-center gap-1 rounded-full ${config.color} px-2 py-1`}
                    >
                      <Sparkles className="h-3 w-3 text-white" />
                      <span className="text-xs font-medium text-white">
                        Done
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Category indicator */}
                {!isCompleted && (
                  <div
                    className={`ml-auto h-2 w-2 shrink-0 rounded-full ${config.color} opacity-40`}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Enhanced Encouragement message */}
      <AnimatePresence>
        {completedCount === totalCount && totalCount > 0 && (
          <motion.div
            className="text-center"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-linear-to-r from-blue-500/10 via-red-500/10 to-purple-500/10 px-5 py-3 shadow-lg dark:border-white/10"
              animate={{
                boxShadow: [
                  "0 10px 30px -15px rgba(59, 130, 246, 0.3)",
                  "0 10px 30px -15px rgba(239, 68, 68, 0.3)",
                  "0 10px 30px -15px rgba(168, 85, 247, 0.3)",
                  "0 10px 30px -15px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </motion.div>
              <span className="text-sm font-semibold text-black dark:text-white">
                Perfect day! All habits complete 🎉
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
