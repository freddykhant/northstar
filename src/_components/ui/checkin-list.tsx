"use client";

import { Check, Sparkles } from "lucide-react";
import { CATEGORY_EMOJIS } from "~/lib/constants";
import type { CategoryId, HabitWithStatus } from "~/lib/types";

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

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2.5">
        <span className="text-xl font-semibold text-white">
          {completedCount}
        </span>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-400">{totalCount}</span>
        <div className="ml-2 h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.1]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-red-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Habit toggles */}
      <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
        {habits.map((habit) => {
          const categoryId = habit.category.id as CategoryId;
          const config = categoryConfig[categoryId];
          const isCompleted = habit.isCompleted;
          const isAnimating = justCompleted.has(habit.id);

          return (
            <button
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              disabled={isLoading}
              className={`group relative flex w-full items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
                isCompleted
                  ? `border-white/[0.12] bg-white/[0.08] shadow-lg ${config.glowColor}`
                  : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.05]"
              } ${isAnimating ? "scale-[0.98]" : ""}`}
            >
              {/* Checkbox */}
              <div
                className={`relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                  isCompleted
                    ? `${config.color} ring-2 ${config.ringColor}`
                    : `border-2 border-zinc-600 group-hover:${config.borderColor}`
                }`}
              >
                <Check
                  className={`h-3 w-3 text-white transition-all duration-200 ${
                    isCompleted ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                />
              </div>

              {/* Icon */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                  isCompleted
                    ? `bg-white/[0.1] ${config.textColor}`
                    : "bg-white/[0.05] text-zinc-500"
                }`}
              >
                <span className="text-base">{CATEGORY_EMOJIS[categoryId]}</span>
              </div>

              {/* Label */}
              <div className="min-w-0 flex-1 text-left">
                <span
                  className={`text-sm font-medium transition-all duration-300 ${
                    isCompleted ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {habit.name}
                </span>
                {habit.description && (
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Category dot */}
              <div
                className={`ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.color} opacity-60`}
              />
            </button>
          );
        })}
      </div>

      {/* Encouragement message */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="py-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-gradient-to-r from-blue-500/20 via-red-500/20 to-purple-500/20 px-4 py-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Perfect day!</span>
          </div>
        </div>
      )}
    </div>
  );
}
