"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CATEGORY_EMOJIS } from "~/lib/constants";
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

const categoryConfig = {
  mind: {
    label: "Mind",
    description: "Mental & intellectual growth",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/20",
    glowColor: "shadow-blue-500/20",
  },
  body: {
    label: "Body",
    description: "Physical health & fitness",
    color: "bg-red-500",
    textColor: "text-red-400",
    borderColor: "border-red-500/20",
    glowColor: "shadow-red-500/20",
  },
  soul: {
    label: "Soul",
    description: "Emotional & spiritual wellbeing",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-purple-500/20",
  },
} as const;

export function HabitsList({
  habits,
  onEdit,
  onToggle,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: HabitsListProps) {
  const [hoveredHabit, setHoveredHabit] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const groupedHabits = {
    mind: habits.filter((h) => h.categoryId === "mind"),
    body: habits.filter((h) => h.categoryId === "body"),
    soul: habits.filter((h) => h.categoryId === "soul"),
  };

  return (
    <div className="space-y-8">
      {(Object.keys(groupedHabits) as Category[]).map((category) => {
        const config = categoryConfig[category];
        const categoryHabits = groupedHabits[category];

        if (categoryHabits.length === 0) return null;

        return (
          <div key={category}>
            <div className="mb-4 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${config.color}`} />
              <div>
                <h2 className={`text-lg font-medium ${config.textColor}`}>
                  {config.label}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">{config.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {categoryHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`group relative flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 backdrop-blur-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/6 dark:bg-white/3 dark:hover:border-white/10 dark:hover:bg-white/5 ${
                    hoveredHabit === habit.id
                      ? `shadow-lg ${config.glowColor}`
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredHabit(habit.id)}
                  onMouseLeave={() => setHoveredHabit(null)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/5 ${config.textColor}`}
                    >
                      <span className="text-xl">
                        {CATEGORY_EMOJIS[category as CategoryId]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-black dark:text-white">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Active/Inactive indicator */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        habit.isActive
                          ? `${config.color} border-transparent`
                          : "border-zinc-300 bg-transparent dark:border-zinc-600"
                      }`}
                    >
                      {habit.isActive && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* More options */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === habit.id ? null : habit.id,
                          )
                        }
                        disabled={isToggling || isDeleting}
                        className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10"
                      >
                        <MoreHorizontal className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </button>

                      {openMenuId === habit.id && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          {/* Menu */}
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-zinc-900">
                            <button
                              onClick={() => {
                                onEdit(habit);
                                setOpenMenuId(null);
                              }}
                              disabled={isToggling || isDeleting}
                              className="w-full px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onToggle(habit.id);
                                setOpenMenuId(null);
                              }}
                              disabled={isToggling || isDeleting}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                            >
                              {isToggling && (
                                <div className="h-3 w-3 animate-spin rounded-full border border-zinc-600 border-t-white" />
                              )}
                              {habit.isActive ? "Deactivate" : "Activate"}
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
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                            >
                              {isDeleting && (
                                <div className="h-3 w-3 animate-spin rounded-full border border-red-600 border-t-red-300" />
                              )}
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
