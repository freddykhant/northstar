"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CategoryId, HabitWithStatus } from "~/lib/types";
import { Card, Checkbox, Pill } from "./primitives";
import { Confetti } from "./confetti";

interface CheckinListProps {
  habits: HabitWithStatus[];
  onToggle: (habitId: number) => void;
  isLoading: boolean;
}

export function CheckinList({ habits, onToggle, isLoading }: CheckinListProps) {
  const reduce = useReducedMotion();
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const [celebrate, setCelebrate] = useState(false);
  const wasAllDone = useRef(allDone);

  useEffect(() => {
    // Fire only on the transition INTO a complete day, never on mount and
    // never repeatedly while it stays complete.
    if (allDone && !wasAllDone.current) setCelebrate(true);
    wasAllDone.current = allDone;
  }, [allDone]);

  return (
    <Card>
      <Confetti trigger={celebrate} onDone={() => setCelebrate(false)} />

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-title text-[var(--color-ink)]">Today</h2>
        <span className="tabular text-[12px] font-bold text-[var(--color-ink-muted)]">
          {completedCount} of {totalCount}
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-sunken)]">
        <motion.div
          className="h-full rounded-full bg-[var(--color-mind)]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 30 }
          }
        />
      </div>

      <ul>
        {habits.map((habit) => {
          const categoryId = habit.category.id as CategoryId;
          const done = habit.isCompleted;

          return (
            <li
              key={habit.id}
              className="border-b border-[var(--color-hairline)] last:border-0"
            >
              <button
                role="checkbox"
                aria-checked={done}
                aria-label={`${habit.name} — ${done ? "kept" : "not kept"}`}
                onClick={() => onToggle(habit.id)}
                disabled={isLoading}
                className="flex w-full items-center gap-3 py-3 text-left disabled:opacity-50"
              >
                <Checkbox
                  checked={done}
                  category={categoryId}
                  disabled={isLoading}
                />

                <span className="min-w-0 flex-1">
                  {/* Both layers share one grid cell so they wrap identically —
                      the base text stays fully visible; the invisible overlay
                      carries the animated line-through, which (unlike an
                      absolutely-positioned bar) follows every wrapped line. */}
                  <span className="grid grid-cols-1">
                    <span
                      className="col-start-1 row-start-1 text-[14px] font-semibold text-[var(--color-ink)]"
                      style={{ opacity: done ? 0.45 : 1 }}
                    >
                      {habit.name}
                    </span>
                    <motion.span
                      aria-hidden
                      className="col-start-1 row-start-1 text-[14px] font-semibold text-transparent [text-decoration-color:var(--color-ink-faint)] [text-decoration-line:line-through] [text-decoration-thickness:1.5px]"
                      initial={false}
                      animate={{ clipPath: done ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                      transition={reduce ? { duration: 0 } : { duration: 0.22 }}
                    >
                      {habit.name}
                    </motion.span>
                  </span>
                  {habit.description && (
                    <span className="mt-0.5 block text-[12px] text-[var(--color-ink-muted)]">
                      {habit.description}
                    </span>
                  )}
                </span>

                <Pill category={categoryId} />
              </button>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="mt-4 text-center text-[13px] font-semibold text-[var(--color-ink-muted)]">
          Every one of them. Nice.
        </p>
      )}
    </Card>
  );
}
