"use client";

import { useEffect, useState } from "react";
import { formatDateAsLocal } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Card } from "./primitives";

type MoodLevel = 1 | 2 | 3 | 4 | 5;

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
  const [moodError, setMoodError] = useState<string | null>(null);

  const today = formatDateAsLocal(new Date());

  const { data: todayMood, isLoading: todayLoading } =
    api.mood.getByDate.useQuery({ date: today });

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const { data: weekMoods, isLoading: weekLoading } =
    api.mood.getRange.useQuery({
      startDate: formatDateAsLocal(startOfWeek),
      endDate: today,
    });

  const { data: yearMoods, isLoading: yearLoading } =
    api.mood.getYearMoods.useQuery();

  const utils = api.useUtils();

  const setMoodMutation = api.mood.set.useMutation({
    onMutate: async (variables) => {
      await utils.mood.getByDate.cancel({ date: today });
      await utils.mood.getRange.cancel();
      await utils.mood.getYearMoods.cancel();

      const previousTodayMood = utils.mood.getByDate.getData({ date: today });
      const previousWeekMoods = utils.mood.getRange.getData({
        startDate: formatDateAsLocal(startOfWeek),
        endDate: today,
      });
      const previousYearMoods = utils.mood.getYearMoods.getData();

      utils.mood.getByDate.setData({ date: today }, (old) => {
        if (old) return { ...old, level: variables.level };
        return {
          id: -1,
          userId: "",
          level: variables.level,
          moodDate: today,
          createdAt: new Date(),
        };
      });

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
            updated[existingIndex] = {
              ...updated[existingIndex]!,
              level: variables.level,
            };
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

      utils.mood.getYearMoods.setData(undefined, (old) => {
        if (!old) return old;
        const existingIndex = old.findIndex((m) => m.moodDate === today);
        if (existingIndex >= 0) {
          const updated = [...old];
          updated[existingIndex] = {
            ...updated[existingIndex]!,
            level: variables.level,
          };
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
      void utils.mood.getByDate.invalidate({ date: today });
      void utils.mood.getRange.invalidate({
        startDate: formatDateAsLocal(startOfWeek),
        endDate: today,
      });
      void utils.mood.getYearMoods.invalidate();
    },
    onError: (error, _variables, context) => {
      setMoodError(error.message ?? "Failed to save mood. Please try again.");
      if (context?.previousTodayMood !== undefined) {
        utils.mood.getByDate.setData(
          { date: today },
          context.previousTodayMood,
        );
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

  const hasSubmitted = !!todayMood;

  useEffect(() => {
    if (todayMood && !selectedMood) {
      setSelectedMood(todayMood.level as MoodLevel);
    }
  }, [todayMood, selectedMood]);

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
      setMoodError(null);
      setMoodMutation.mutate({ level: selectedMood, date: today });
    }
  };

  const Spinner = () => (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-hairline)] border-t-[var(--color-mind)]" />
  );

  if (todayLoading) {
    return (
      <Card className="flex items-center justify-center py-10">
        <Spinner />
      </Card>
    );
  }

  return (
    <Card>
      {moodError && (
        <div className="mb-4 flex items-center justify-between rounded-[6px] border border-[var(--color-mind)]/30 bg-[var(--color-mind)]/8 px-3 py-2 text-[12px] text-[var(--color-mind)]">
          <span>{moodError}</span>
          <button
            type="button"
            onClick={() => setMoodError(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {!hasSubmitted ? (
        <div>
          <h2 className="text-title mb-4 text-[var(--color-ink)]">
            How are you feeling today?
          </h2>

          <div className="mb-5 flex justify-between gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedMood(level)}
                aria-label={`Mood level ${level}`}
                className={`flex flex-1 items-center justify-center rounded-[8px] border py-3 text-[24px] ${
                  selectedMood === level
                    ? "border-[var(--color-mind)] bg-[var(--color-mind)]/8"
                    : "border-[var(--color-hairline)] hover:border-[var(--color-ink-faint)]"
                }`}
              >
                <span aria-hidden>{MOOD_EMOJIS[level]}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMood || setMoodMutation.isPending}
            className="w-full rounded-[8px] bg-[var(--color-ink)] py-2.5 text-[13px] font-medium text-[var(--color-canvas)] hover:opacity-90 disabled:opacity-50"
          >
            {setMoodMutation.isPending ? "Saving…" : "Save today's mood"}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-title text-[var(--color-ink)]">Your mood</h2>
            <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--color-sunken)] p-1">
              {(["week", "year"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={viewMode === mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-[8px] px-3 py-1 text-[12px] font-semibold capitalize ${
                    viewMode === mode
                      ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-card)]"
                      : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "week" ? (
            <>
              <div className="mb-5 flex h-[120px] items-end justify-between gap-2">
                {weekLoading ? (
                  <div className="flex w-full items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  weekData.map((day, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-[2px] bg-[var(--color-mind)]/70"
                        style={{
                          height: `${(day.level / 5) * 100}%`,
                          minHeight: "8px",
                        }}
                      />
                      <span className="text-[10px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase">
                        {day.dayLabel.slice(0, 1)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-hairline)] pt-4">
                <span className="text-[11px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase">
                  Weekly average
                </span>
                <div className="flex items-baseline gap-2">
                  <span aria-hidden className="text-[20px]">
                    {MOOD_EMOJIS[Math.round(weekAverage) as MoodLevel]}
                  </span>
                  <span className="tabular text-[20px] font-medium text-[var(--color-ink)]">
                    {weekAverage.toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {yearLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner />
                </div>
              ) : (
                <div className="flex items-baseline justify-center gap-3 py-6">
                  <span aria-hidden className="text-[48px]">
                    {MOOD_EMOJIS[Math.round(yearAverage) as MoodLevel]}
                  </span>
                  <span className="tabular text-[56px] leading-none font-bold tracking-[-0.02em] text-[var(--color-ink)]">
                    {yearAverage.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="border-t border-[var(--color-hairline)] pt-4 text-center text-[11px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase">
                Yearly average
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedMood(null);
              void utils.mood.getByDate.invalidate();
            }}
            className="mt-4 w-full rounded-[6px] border border-[var(--color-hairline)] py-2 text-[12px] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
          >
            Update today&apos;s mood
          </button>
        </div>
      )}
    </Card>
  );
}
