"use client";

import { useState } from "react";
import { CATEGORY_COLORS } from "~/lib/constants";

interface HabitItem {
  id: number;
  name: string;
  category: "mind" | "body" | "soul";
  emoji: string;
}

const DEMO_HABITS: HabitItem[] = [
  { id: 1, name: "Morning meditation", category: "mind", emoji: "🧘" },
  { id: 2, name: "Read for 30 minutes", category: "mind", emoji: "📚" },
  { id: 3, name: "Workout session", category: "body", emoji: "🏋️" },
  { id: 4, name: "Evening gratitude", category: "soul", emoji: "✨" },
];

export function InteractiveHabitDemo() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleHabit = (id: number) => {
    setCompleted((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Glass Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Today's Focus</h3>
          <div className="rounded-lg bg-white/5 px-3 py-1 text-sm text-zinc-400">
            {completed.size}/{DEMO_HABITS.length}
          </div>
        </div>

        <div className="space-y-2">
          {DEMO_HABITS.map((habit) => {
            const isCompleted = completed.has(habit.id);
            const colors = CATEGORY_COLORS[habit.category];

            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                  isCompleted
                    ? `${colors.border} ${colors.card} shadow-lg`
                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                }`}
              >
                {/* Glow effect on completion */}
                {isCompleted && (
                  <div
                    className={`absolute inset-0 ${colors.glow} animate-pulse opacity-20`}
                  />
                )}

                <div className="relative flex items-center gap-3">
                  {/* Checkbox */}
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      isCompleted
                        ? `${colors.border} ${colors.bg}`
                        : "border-zinc-700 group-hover:border-zinc-600"
                    }`}
                  >
                    {isCompleted && (
                      <svg
                        className="h-4 w-4 animate-scale-in text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.emoji}</span>
                      <span
                        className={`font-medium transition-colors ${
                          isCompleted ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {habit.name}
                      </span>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${colors.badge}`}
                  >
                    {habit.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion celebration */}
        {completed.size === DEMO_HABITS.length && (
          <div className="mt-4 animate-fade-in-up rounded-xl bg-gradient-to-r from-blue-500/20 via-red-500/20 to-purple-500/20 p-4 text-center">
            <p className="text-2xl">🎉</p>
            <p className="mt-1 text-sm font-medium text-white">
              All done for today!
            </p>
          </div>
        )}
      </div>

      {/* Pointer hint */}
      <div className="pointer-events-none absolute -right-12 top-1/2 hidden -translate-y-1/2 animate-bounce-slow xl:block">
        <div className="text-4xl">👈</div>
        <p className="mt-1 text-xs text-zinc-500">Try it!</p>
      </div>
    </div>
  );
}
