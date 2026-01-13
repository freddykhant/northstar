"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type MoodLevel = 1 | 2 | 3 | 4 | 5;

interface MoodData {
  level: MoodLevel;
  date: string;
}

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😢",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😄",
};

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Struggling",
  2: "Not great",
  3: "Okay",
  4: "Good",
  5: "Amazing",
};

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "year">("week");

  // Mock data for demonstration - in production, this would come from your backend
  const weekData: MoodData[] = [
    { level: 4, date: "Mon" },
    { level: 3, date: "Tue" },
    { level: 5, date: "Wed" },
    { level: 4, date: "Thu" },
    { level: 5, date: "Fri" },
    { level: 4, date: "Sat" },
    { level: selectedMood ?? 5, date: "Sun" },
  ];

  const yearAverage = 4.2; // Mock average
  const weekAverage =
    weekData.reduce((sum, day) => sum + day.level, 0) / weekData.length;

  const handleSubmit = () => {
    if (selectedMood) {
      setHasSubmitted(true);
      // Here you would save to backend
    }
  };

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 backdrop-blur-sm dark:border-white/6 dark:bg-white/3"
    >
      {!hasSubmitted ? (
        // Input Mode
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              How are you feeling today?
            </h3>
            <span className="text-3xl">
              {selectedMood ? MOOD_EMOJIS[selectedMood] : "😊"}
            </span>
          </div>

          <div className="mb-6 flex justify-between gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedMood(level)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  selectedMood === level
                    ? "scale-105 border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-2xl">{MOOD_EMOJIS[level]}</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {MOOD_LABELS[level]}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="w-full rounded-lg bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            Save Today's Mood
          </button>
        </motion.div>
      ) : (
        // Graph Mode
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Your Happiness
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("week")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  viewMode === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("year")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  viewMode === "year"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
                }`}
              >
                Year
              </button>
            </div>
          </div>

          {viewMode === "week" ? (
            <>
              {/* Week Bar Chart */}
              <div className="mb-6 flex items-end justify-between gap-2">
                {weekData.map((day, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.level / 5) * 100}%` }}
                      transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
                      className="w-full rounded-t-lg bg-linear-to-t from-blue-500 via-purple-500 to-pink-500"
                      style={{ minHeight: "20px", maxHeight: "120px" }}
                    />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {day.date}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-white/5">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Weekly Average
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {MOOD_EMOJIS[Math.round(weekAverage) as MoodLevel]}
                  </span>
                  <span className="text-lg font-bold text-black dark:text-white">
                    {weekAverage.toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Year Ring Chart */}
              <div className="mb-6 flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full -rotate-90 transform">
                    {/* Background ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="16"
                      className="text-zinc-200 dark:text-white/10"
                    />
                    {/* Progress ring */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{
                        strokeDashoffset: 440 - (440 * yearAverage) / 5,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        strokeDasharray: 440,
                      }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl">
                      {MOOD_EMOJIS[Math.round(yearAverage) as MoodLevel]}
                    </span>
                    <span className="text-2xl font-bold text-black dark:text-white">
                      {yearAverage.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-white/5">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Yearly Average Happiness
                </span>
              </div>
            </>
          )}

          <button
            onClick={() => setHasSubmitted(false)}
            className="mt-4 w-full rounded-lg border border-zinc-200 py-2 text-sm text-zinc-600 transition-all hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            Update Today's Mood
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
