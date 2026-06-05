"use client";

import { DotsThree } from "@phosphor-icons/react";
import { useState } from "react";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_HEX,
  CATEGORY_LABELS,
} from "~/lib/constants";
import type { CategoryId } from "~/lib/types";

type Category = "mind" | "body" | "soul";

interface Habit {
  id: number;
  name: string;
  description: string | null;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  userId: string;
  updatedAt: Date | null;
  category: {
    id: string;
    name: string;
    color: string;
    createdAt: Date;
  };
}

interface HabitsListProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export function HabitsList({
  habits,
  onEdit,
  onToggle,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: HabitsListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const groupedHabits = {
    mind: habits.filter((h) => h.categoryId === "mind"),
    body: habits.filter((h) => h.categoryId === "body"),
    soul: habits.filter((h) => h.categoryId === "soul"),
  };

  return (
    <div className="space-y-10">
      {(Object.keys(groupedHabits) as Category[]).map((category) => {
        const categoryHabits = groupedHabits[category];
        if (categoryHabits.length === 0) return null;

        const tint = CATEGORY_HEX[category as CategoryId];

        return (
          <section key={category}>
            <div className="mb-4 flex items-baseline gap-3 border-b border-black/8 pb-2 dark:border-white/8">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: tint }}
              />
              <h2 className="text-[11px] font-medium tracking-[0.14em] text-[var(--color-ink)] uppercase dark:text-[var(--color-ink-dark)]">
                {CATEGORY_LABELS[category as CategoryId]}
              </h2>
              <p className="text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                {CATEGORY_DESCRIPTIONS[category as CategoryId]}
              </p>
            </div>

            <ul className="divide-y divide-black/8 dark:divide-white/8">
              {categoryHabits.map((habit) => (
                <li
                  key={habit.id}
                  className="group flex items-center justify-between py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                      {habit.name}
                    </h3>
                    {habit.description && (
                      <p className="mt-0.5 text-[12px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                        {habit.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-medium tracking-[0.12em] uppercase ${
                        habit.isActive
                          ? "text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
                          : "text-[var(--color-ink-muted)]/60 dark:text-[var(--color-ink-dark-muted)]/60"
                      }`}
                    >
                      {habit.isActive ? "Active" : "Paused"}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === habit.id ? null : habit.id,
                          )
                        }
                        disabled={isToggling || isDeleting}
                        aria-label="More options"
                        className="rounded-[4px] p-1.5 opacity-0 hover:bg-black/6 group-hover:opacity-100 disabled:opacity-30 dark:hover:bg-white/6"
                      >
                        <DotsThree size={16} weight="bold" />
                      </button>

                      {openMenuId === habit.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute top-full right-0 z-20 mt-1 w-40 overflow-hidden rounded-[8px] border border-black/8 bg-[var(--color-paper-raised)] py-1 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
                            <button
                              onClick={() => {
                                onEdit(habit);
                                setOpenMenuId(null);
                              }}
                              disabled={isToggling || isDeleting}
                              className="w-full px-3 py-2 text-left text-[13px] text-[var(--color-ink)] hover:bg-black/4 disabled:opacity-50 dark:text-[var(--color-ink-dark)] dark:hover:bg-white/4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onToggle(habit.id);
                                setOpenMenuId(null);
                              }}
                              disabled={isToggling || isDeleting}
                              className="w-full px-3 py-2 text-left text-[13px] text-[var(--color-ink)] hover:bg-black/4 disabled:opacity-50 dark:text-[var(--color-ink-dark)] dark:hover:bg-white/4"
                            >
                              {habit.isActive ? "Pause" : "Resume"}
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to delete "${habit.name}"?`,
                                  )
                                ) {
                                  onDelete(habit.id);
                                }
                                setOpenMenuId(null);
                              }}
                              disabled={isToggling || isDeleting}
                              className="w-full px-3 py-2 text-left text-[13px] text-[var(--color-ember)] hover:bg-[var(--color-ember)]/8 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
