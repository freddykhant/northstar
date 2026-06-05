"use client";

import { Check } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { CATEGORY_HEX } from "~/lib/constants";
import type { CategoryId, HabitWithStatus } from "~/lib/types";
import { Confetti } from "./confetti";

interface CheckinListProps {
  habits: HabitWithStatus[];
  onToggle: (habitId: number) => void;
  justCompleted: Set<number>;
  isLoading: boolean;
}

export function CheckinList({
  habits,
  onToggle,
  isLoading,
}: CheckinListProps) {
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(completedCount);

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
    <div>
      <Confetti trigger={shouldCelebrate} />

      {/* Heading + progress */}
      <div className="mb-5 flex items-baseline justify-between">
        <h3
          className="font-serif text-[22px] leading-none font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
          style={{ fontOpticalSizing: "auto", letterSpacing: "-0.01em" }}
        >
          Today
        </h3>
        <span className="tabular text-[11px] tracking-[0.08em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
          {completedCount} / {totalCount}
        </span>
      </div>

      <div className="mb-5 h-[2px] overflow-hidden rounded-full bg-black/6 dark:bg-white/6">
        <div
          className="h-full rounded-full bg-[var(--color-ember)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Habit rows */}
      <ul className="divide-y divide-black/8 dark:divide-white/8">
        {habits.map((habit) => {
          const categoryId = habit.category.id as CategoryId;
          const tint = CATEGORY_HEX[categoryId];
          const isCompleted = habit.isCompleted;

          return (
            <li key={habit.id}>
              <button
                role="checkbox"
                aria-checked={isCompleted}
                aria-label={`${habit.name} — ${isCompleted ? "completed" : "not completed"}`}
                onClick={() => onToggle(habit.id)}
                disabled={isLoading}
                className="group flex w-full items-center gap-4 py-3.5 text-left disabled:opacity-50"
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tint }}
                />

                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                    isCompleted
                      ? "border-[var(--color-ember)] bg-[var(--color-ember)]"
                      : "border-black/16 group-hover:border-[var(--color-ember)] dark:border-white/16"
                  }`}
                >
                  {isCompleted && (
                    <Check size={12} weight="bold" color="#fbf9f3" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[14px] ${
                      isCompleted
                        ? "text-[var(--color-ink-muted)] line-through dark:text-[var(--color-ink-dark-muted)]"
                        : "text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
                    }`}
                  >
                    {habit.name}
                  </span>
                  {habit.description && (
                    <span className="mt-0.5 block text-[12px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                      {habit.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {completedCount === totalCount && totalCount > 0 && (
        <p className="mt-6 text-center font-serif text-[14px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
          A clean sweep. Well done.
        </p>
      )}
    </div>
  );
}
