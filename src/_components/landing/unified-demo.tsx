"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface HabitItem {
  id: number;
  name: string;
  category: "mind" | "body" | "soul";
  emoji: string;
  graphPosition: number; // Which square to light up (0-6 for a week)
}

const DEMO_HABITS: HabitItem[] = [
  {
    id: 1,
    name: "Morning meditation",
    category: "mind",
    emoji: "🧘",
    graphPosition: 6,
  },
  {
    id: 2,
    name: "30 min workout",
    category: "body",
    emoji: "🏋️",
    graphPosition: 6,
  },
  {
    id: 3,
    name: "Evening gratitude",
    category: "soul",
    emoji: "✨",
    graphPosition: 6,
  },
];

const CATEGORY_COLORS = {
  mind: {
    bg: "bg-blue-500",
    border: "border-blue-500",
    shadow: "shadow-blue-500/50",
  },
  body: {
    bg: "bg-red-500",
    border: "border-red-500",
    shadow: "shadow-red-500/50",
  },
  soul: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    shadow: "shadow-purple-500/50",
  },
};

// Pre-filled week data (Mon-Sat filled, Sunday waiting for user)
const WEEK_DATA = [
  { mind: true, body: true, soul: true }, // Mon
  { mind: true, body: false, soul: true }, // Tue
  { mind: true, body: true, soul: true }, // Wed
  { mind: false, body: true, soul: true }, // Thu
  { mind: true, body: true, soul: false }, // Fri
  { mind: true, body: true, soul: true }, // Sat
  { mind: false, body: false, soul: false }, // Sun (today - user fills this!)
];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function UnifiedDemo() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [justCompleted, setJustCompleted] = useState<number | null>(null);

  const toggleHabit = (habit: HabitItem) => {
    setCompleted((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habit.id)) {
        newSet.delete(habit.id);
      } else {
        newSet.add(habit.id);
        setJustCompleted(habit.id);
        setTimeout(() => setJustCompleted(null), 1000);
      }
      return newSet;
    });
  };

  // Get the current state for today's column
  const getTodayState = (category: "mind" | "body" | "soul") => {
    const habit = DEMO_HABITS.find((h) => h.category === category);
    return habit ? completed.has(habit.id) : false;
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Glass container */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-black/5">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-3 flex-1 rounded-lg bg-zinc-100 px-4 py-1.5">
            <span className="text-xs text-zinc-500">northstar.app/home</span>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Left: Activity Graph */}
          <div className="border-b border-zinc-100 p-8 lg:border-r lg:border-b-0">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black">This Week</h3>
              <p className="text-sm text-zinc-500">Your activity at a glance</p>
            </div>

            {/* Mini Graph */}
            <div className="space-y-3">
              {(["mind", "body", "soul"] as const).map((category) => (
                <div key={category} className="flex items-center gap-4">
                  <span className="w-12 text-xs font-medium text-zinc-500 capitalize">
                    {category}
                  </span>
                  <div className="flex gap-1.5">
                    {WEEK_DATA.map((day, dayIndex) => {
                      const isToday = dayIndex === 6;
                      const isFilled = isToday
                        ? getTodayState(category)
                        : day[category];
                      const colors = CATEGORY_COLORS[category];
                      const wasJustCompleted =
                        isToday &&
                        justCompleted !== null &&
                        DEMO_HABITS.find((h) => h.id === justCompleted)
                          ?.category === category;

                      return (
                        <motion.div
                          key={dayIndex}
                          className={`relative h-8 w-8 rounded-lg border-2 transition-colors ${
                            isFilled
                              ? `${colors.bg} ${colors.border}`
                              : isToday
                                ? "border-dashed border-zinc-300 bg-zinc-50"
                                : "border-zinc-200 bg-zinc-100"
                          }`}
                          animate={
                            wasJustCompleted
                              ? {
                                  scale: [1, 1.3, 1],
                                  boxShadow: [
                                    "0 0 0 0 rgba(0,0,0,0)",
                                    `0 0 20px 5px ${category === "mind" ? "rgba(59,130,246,0.5)" : category === "body" ? "rgba(239,68,68,0.5)" : "rgba(168,85,247,0.5)"}`,
                                    "0 0 0 0 rgba(0,0,0,0)",
                                  ],
                                }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          {isToday && !isFilled && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
                              ?
                            </span>
                          )}
                          {isToday && isFilled && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center text-sm text-white"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Day labels */}
              <div className="flex items-center gap-4">
                <span className="w-12" />
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center text-xs ${
                        i === 6
                          ? "font-semibold text-blue-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Today's Checklist */}
          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-black">Today</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                  Sunday
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                Complete habits to light up your graph
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {DEMO_HABITS.map((habit) => {
                const isCompleted = completed.has(habit.id);
                const colors = CATEGORY_COLORS[habit.category];

                return (
                  <motion.button
                    key={habit.id}
                    onClick={() => toggleHabit(habit)}
                    className={`group relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                      isCompleted
                        ? `${colors.border} bg-linear-to-r from-${habit.category === "mind" ? "blue" : habit.category === "body" ? "red" : "purple"}-50 to-white`
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <motion.div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                          isCompleted
                            ? `${colors.bg} ${colors.border}`
                            : "border-zinc-300 bg-white"
                        }`}
                        animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                      >
                        <AnimatePresence>
                          {isCompleted && (
                            <motion.svg
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="h-4 w-4 text-white"
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
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{habit.emoji}</span>
                          <span
                            className={`font-medium ${isCompleted ? "text-zinc-700" : "text-black"}`}
                          >
                            {habit.name}
                          </span>
                        </div>
                      </div>

                      {/* Category indicator */}
                      <div
                        className={`rounded-lg px-3 py-1 text-xs font-medium capitalize ${
                          isCompleted
                            ? `${colors.bg} text-white`
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {habit.category}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Celebration */}
            <AnimatePresence>
              {completed.size === DEMO_HABITS.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 rounded-xl bg-linear-to-r from-blue-500 via-red-500 to-purple-500 p-4 text-center text-white"
                >
                  <span className="text-2xl">🎉</span>
                  <p className="mt-1 font-semibold">
                    Perfect day! All habits complete.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-sm text-zinc-500"
      >
        👆 Try it out!
      </motion.p>
    </div>
  );
}
