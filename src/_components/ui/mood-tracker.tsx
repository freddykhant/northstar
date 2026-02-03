"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDateAsLocal } from "~/lib/utils";
import { api } from "~/trpc/react";

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

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "year">("week");

  const today = formatDateAsLocal(new Date());

  // get today's mood to check if already submitted
  const { data: todayMood, isLoading: todayLoading } =
    api.mood.getByDate.useQuery({ date: today });

  // get week data (last 7 days)
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const { data: weekMoods, isLoading: weekLoading } =
    api.mood.getRange.useQuery({
      startDate: formatDateAsLocal(startOfWeek),
      endDate: today,
    });

  // get year data
  const { data: yearMoods, isLoading: yearLoading } =
    api.mood.getYearMoods.useQuery();

  const utils = api.useUtils();

  const setMoodMutation = api.mood.set.useMutation({
    onMutate: async (variables) => {
      // cancel outgoing refetches
      await utils.mood.getByDate.cancel({ date: today });
      await utils.mood.getRange.cancel();
      await utils.mood.getYearMoods.cancel();

      // snapshot previous values
      const previousTodayMood = utils.mood.getByDate.getData({ date: today });
      const previousWeekMoods = utils.mood.getRange.getData({
        startDate: formatDateAsLocal(startOfWeek),
        endDate: today,
      });
      const previousYearMoods = utils.mood.getYearMoods.getData();

      // optimistically update today's mood
      utils.mood.getByDate.setData({ date: today }, (old) => {
        if (old) {
          return { ...old, level: variables.level };
        }
        return {
          id: -1,
          userId: "",
          level: variables.level,
          moodDate: today,
          createdAt: new Date(),
        };
      });

      // optimistically update week range
      utils.mood.getRange.setData(
        {
          startDate: formatDateAsLocal(startOfWeek),
          endDate: today,
        },
        (old) => {
          if (!old) return old;
          const existingIndex = old.findIndex((m) => m.moodDate === today);
          if (existingIndex >= 0) {
            const updated = [...old];
            updated[existingIndex] = { ...updated[existingIndex]!, level: variables.level };
            return updated;
          }
          return [
            ...old,
            {
              id: -1,
              userId: "",
              level: variables.level,
              moodDate: today,
              createdAt: new Date(),
            },
          ];
        },
      );

      // optimistically update year moods
      utils.mood.getYearMoods.setData(undefined, (old) => {
        if (!old) return old;
        const existingIndex = old.findIndex((m) => m.moodDate === today);
        if (existingIndex >= 0) {
          const updated = [...old];
          updated[existingIndex] = { ...updated[existingIndex]!, level: variables.level };
          return updated;
        }
        return [
          ...old,
          {
            id: -1,
            userId: "",
            level: variables.level,
            moodDate: today,
            createdAt: new Date(),
          },
        ];
      });

      return { previousTodayMood, previousWeekMoods, previousYearMoods };
    },
    onSuccess: () => {
      // invalidate to refetch with real data from server
      void utils.mood.getByDate.invalidate({ date: today });
      void utils.mood.getRange.invalidate({
        startDate: formatDateAsLocal(startOfWeek),
        endDate: today,
      });
      void utils.mood.getYearMoods.invalidate();
    },
    onError: (_error, _variables, context) => {
      // rollback on error
      if (context?.previousTodayMood !== undefined) {
        utils.mood.getByDate.setData({ date: today }, context.previousTodayMood);
      }
      if (context?.previousWeekMoods) {
        utils.mood.getRange.setData(
          {
            startDate: formatDateAsLocal(startOfWeek),
            endDate: today,
          },
          context.previousWeekMoods,
        );
      }
      if (context?.previousYearMoods) {
        utils.mood.getYearMoods.setData(undefined, context.previousYearMoods);
      }
    },
  });

  // check if mood already submitted today
  const hasSubmitted = !!todayMood;

  // set selected mood from today's data
  useEffect(() => {
    if (todayMood && !selectedMood) {
      setSelectedMood(todayMood.level as MoodLevel);
    }
  }, [todayMood, selectedMood]);

  // prepare week data
  const weekData: Array<{ level: MoodLevel; date: string; dayLabel: string }> =
    [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateAsLocal(date);
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayLabel = dayLabels[date.getDay()]!;

    const moodForDay = weekMoods?.find((m) => m.moodDate === dateStr);
    weekData.push({
      level: (moodForDay?.level as MoodLevel) ?? 3,
      date: dateStr,
      dayLabel,
    });
  }

  const weekAverage =
    weekMoods && weekMoods.length > 0
      ? weekMoods.reduce((sum, mood) => sum + mood.level, 0) / weekMoods.length
      : 3;

  const yearAverage =
    yearMoods && yearMoods.length > 0
      ? yearMoods.reduce((sum, mood) => sum + mood.level, 0) / yearMoods.length
      : 3;

  const handleSubmit = () => {
    if (selectedMood) {
      setMoodMutation.mutate({
        level: selectedMood,
        date: today,
      });
    }
  };

  if (todayLoading) {
    return (
      <motion.div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 backdrop-blur-sm dark:border-white/6 dark:bg-white/3">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 backdrop-blur-sm dark:border-white/6 dark:bg-white/3"
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

          <div className="mb-4 flex justify-between gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedMood(level)}
                className={`flex flex-1 items-center justify-center rounded-lg border-2 p-2 transition-all ${
                  selectedMood === level
                    ? "scale-105 border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-2xl">{MOOD_EMOJIS[level]}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedMood || setMoodMutation.isPending}
            className="w-full rounded-lg bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {setMoodMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </div>
            ) : (
              "Save Today's Mood"
            )}
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
                {weekLoading ? (
                  <div className="flex w-full items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
                  </div>
                ) : (
                  weekData.map((day, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.level / 5) * 100}%` }}
                        transition={{
                          delay: i * 0.1,
                          type: "spring",
                          bounce: 0.4,
                        }}
                        className="w-full rounded-t-lg bg-linear-to-t from-blue-500 via-purple-500 to-pink-500"
                        style={{ minHeight: "20px", maxHeight: "120px" }}
                      />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {day.dayLabel}
                      </span>
                    </div>
                  ))
                )}
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
              {yearLoading ? (
                <div className="mb-6 flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
                </div>
              ) : (
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
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
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
              )}

              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-white/5">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Yearly Average Happiness
                </span>
              </div>
            </>
          )}

          <button
            onClick={() => {
              setSelectedMood(null);
              void utils.mood.getByDate.invalidate();
            }}
            className="mt-4 w-full rounded-lg border border-zinc-200 py-2 text-sm text-zinc-600 transition-all hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            Update Today's Mood
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
