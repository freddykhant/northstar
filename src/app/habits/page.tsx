"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, Dumbbell, Plus, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GradientBackground } from "~/_components/ui/gradient-background";
import { Sidebar } from "~/_components/ui/sidebar";
import { CATEGORY_EMOJIS } from "~/lib/constants";
import type { CategoryId } from "~/lib/types";
import { api } from "~/trpc/react";

export default function HabitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "mind" as "mind" | "body" | "soul",
  });

  const utils = api.useUtils();
  const { data: habits, isLoading: habitsLoading } =
    api.habit.getAll.useQuery();

  const createMutation = api.habit.create.useMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      await utils.habit.getAll.cancel();
    },
    onSuccess: () => {
      // Invalidate and refetch
      void utils.habit.getAll.invalidate();
      setIsModalOpen(false);
      setFormData({ name: "", description: "", categoryId: "mind" });
    },
    onError: (error, _variables, context) => {
      // Optionally show error toast
      console.error("Failed to create habit:", error);
    },
  });

  const updateMutation = api.habit.update.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.habit.getAll.cancel();

      // Snapshot the previous value
      const previousHabits = utils.habit.getAll.getData();

      // Optimistically update
      utils.habit.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((habit) =>
          habit.id === variables.id
            ? {
                ...habit,
                name: variables.name,
                description: variables.description || null,
                categoryId: variables.categoryId || habit.categoryId,
              }
            : habit,
        );
      });

      return { previousHabits };
    },
    onSuccess: () => {
      void utils.habit.getAll.invalidate();
      setEditingHabit(null);
      setFormData({ name: "", description: "", categoryId: "mind" });
      setIsModalOpen(false);
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousHabits) {
        utils.habit.getAll.setData(undefined, context.previousHabits);
      }
      console.error("Failed to update habit:", error);
    },
  });

  const toggleMutation = api.habit.toggleActive.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.habit.getAll.cancel();

      // Snapshot the previous value
      const previousHabits = utils.habit.getAll.getData();

      // Optimistically update
      utils.habit.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((habit) =>
          habit.id === variables.id
            ? { ...habit, isActive: !habit.isActive }
            : habit,
        );
      });

      return { previousHabits };
    },
    onSuccess: () => {
      void utils.habit.getAll.invalidate();
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousHabits) {
        utils.habit.getAll.setData(undefined, context.previousHabits);
      }
      console.error("Failed to toggle habit:", error);
    },
  });

  const deleteMutation = api.habit.delete.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.habit.getAll.cancel();

      // Snapshot the previous value
      const previousHabits = utils.habit.getAll.getData();

      // Optimistically update
      utils.habit.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((habit) => habit.id !== variables.id);
      });

      return { previousHabits };
    },
    onSuccess: () => {
      void utils.habit.getAll.invalidate();
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousHabits) {
        utils.habit.getAll.setData(undefined, context.previousHabits);
      }
      console.error("Failed to delete habit:", error);
    },
  });

  if (status === "loading" || habitsLoading) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0c0c0c]">
        <GradientBackground />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
            <div className="text-sm text-zinc-400">Loading habits...</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.push("/signin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingHabit) {
      updateMutation.mutate({
        id: editingHabit,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditModal = (habit: NonNullable<typeof habits>[0]) => {
    setEditingHabit(habit.id);
    setFormData({
      name: habit.name,
      description: habit.description ?? "",
      categoryId: habit.categoryId as "mind" | "body" | "soul",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
    setFormData({ name: "", description: "", categoryId: "mind" });
  };

  const categoryConfig = {
    mind: {
      label: "Mind",
      icon: Brain,
      description: "Mental & intellectual growth",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      lightBg: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-500/20",
      glowColor: "shadow-blue-500/30",
      examples: [
        "Read for 30 minutes",
        "Practice a new language",
        "Journal thoughts",
      ],
    },
    body: {
      label: "Body",
      icon: Dumbbell,
      description: "Physical health & fitness",
      color: "bg-red-500",
      textColor: "text-red-500",
      lightBg: "bg-red-50 dark:bg-red-500/10",
      borderColor: "border-red-200 dark:border-red-500/20",
      glowColor: "shadow-red-500/30",
      examples: ["Morning workout", "10,000 steps", "Healthy breakfast"],
    },
    soul: {
      label: "Soul",
      icon: Sparkles,
      description: "Emotional & spiritual wellbeing",
      color: "bg-purple-500",
      textColor: "text-purple-500",
      lightBg: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-500/20",
      glowColor: "shadow-purple-500/30",
      examples: [
        "Meditation session",
        "Gratitude practice",
        "Connect with loved ones",
      ],
    },
  } as const;

  const groupedHabits = {
    mind: habits?.filter((h) => h.categoryId === "mind") ?? [],
    body: habits?.filter((h) => h.categoryId === "body") ?? [],
    soul: habits?.filter((h) => h.categoryId === "soul") ?? [],
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white dark:bg-[#0c0c0c]">
      {/* Background */}
      <GradientBackground />

      {/* Sidebar */}
      <Sidebar
        user={session?.user}
        onCreateHabit={() => setIsModalOpen(true)}
      />

      {/* Content */}
      <main className="relative z-10 ml-64 flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <motion.div
            className="mb-10 flex items-end justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="mb-2 bg-linear-to-r from-black via-zinc-700 to-zinc-400 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:via-zinc-100 dark:to-zinc-400">
                Your Habits
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Build your life across{" "}
                <span className="font-semibold text-blue-500">Mind</span>,{" "}
                <span className="font-semibold text-red-500">Body</span>, and{" "}
                <span className="font-semibold text-purple-500">Soul</span>
              </p>
            </div>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Add Habit
            </motion.button>
          </motion.div>

          {/* 3-Column Layout by Category */}
          {habits && habits.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {(["mind", "body", "soul"] as const).map((category, idx) => {
                const config = categoryConfig[category];
                const categoryHabits = groupedHabits[category];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col"
                  >
                    {/* Column Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}
                        >
                          <Icon
                            className="h-5 w-5 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                        <div>
                          <h2
                            className={`text-xl font-bold ${config.textColor}`}
                          >
                            {config.label}
                          </h2>
                          <p className="text-xs text-zinc-500">
                            {categoryHabits.length}{" "}
                            {categoryHabits.length === 1 ? "habit" : "habits"}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => {
                          setFormData({ ...formData, categoryId: category });
                          setIsModalOpen(true);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`rounded-lg ${config.lightBg} ${config.textColor} p-1.5 transition-colors hover:opacity-80`}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Habits List */}
                    <div className="flex flex-col gap-3">
                      <AnimatePresence mode="popLayout">
                        {categoryHabits.map((habit) => (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            config={config}
                            onEdit={openEditModal}
                            onToggle={(id) => toggleMutation.mutate({ id })}
                            onDelete={(id) => deleteMutation.mutate({ id })}
                            isToggling={toggleMutation.isPending}
                            isDeleting={deleteMutation.isPending}
                            showMenu={openMenuId === habit.id}
                            onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                          />
                        ))}
                      </AnimatePresence>
                      {categoryHabits.length === 0 && (
                        <div
                          className={`rounded-xl border ${config.borderColor} ${config.lightBg} p-4 text-center`}
                        >
                          <p className="text-sm text-zinc-500">No habits yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState onCreateHabit={() => setIsModalOpen(true)} />
          )}
        </div>
      </main>

      {/* Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingHabit={editingHabit}
        habits={habits}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        toggleMutation={toggleMutation}
        categoryConfig={categoryConfig}
      />
    </div>
  );
}

// HabitCard Component
function HabitCard({
  habit,
  config,
  onEdit,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
  showMenu,
  onToggleMenu,
}: {
  habit: any;
  config: any;
  onEdit: (habit: any) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  isToggling: boolean;
  isDeleting: boolean;
  showMenu: boolean;
  onToggleMenu: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-2xl border ${config.borderColor} bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-white/3 ${showMenu ? "z-50" : ""}`}
    >
      {/* Content */}
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <motion.div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.lightBg}`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xl">
              {CATEGORY_EMOJIS[habit.categoryId as CategoryId]}
            </span>
          </motion.div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate font-semibold text-black dark:text-white">
              {habit.name}
            </h3>
            {habit.description && (
              <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Status & Menu */}
        <div className="ml-2 flex items-center gap-2">
          <AnimatePresence>
            {habit.isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`flex h-7 w-7 items-center justify-center rounded-full ${config.color}`}
              >
                <svg
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
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Menu Button */}
          <div className="relative">
            <motion.button
              onClick={() => onToggleMenu(habit.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-lg p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-white/10"
            >
              <svg
                className="h-4 w-4 text-zinc-600 dark:text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v.01M12 12v.01M12 18v.01"
                />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => onToggleMenu(habit.id)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full right-0 z-50 mt-2 w-40 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-white/10 dark:bg-zinc-900"
                  >
                    <button
                      onClick={() => {
                        onEdit(habit);
                        onToggleMenu(habit.id);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
                    >
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggle(habit.id);
                        onToggleMenu(habit.id);
                      }}
                      disabled={isToggling}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-white/5"
                    >
                      {habit.isActive ? "Pause" : "Activate"}
                    </button>
                    <div className="my-1 h-px bg-zinc-200 dark:bg-white/10" />
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${habit.name}"?`)) {
                          onDelete(habit.id);
                        }
                        onToggleMenu(habit.id);
                      }}
                      disabled={isDeleting}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// EmptyState Component
function EmptyState({ onCreateHabit }: { onCreateHabit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white p-20 backdrop-blur-sm dark:border-white/6 dark:bg-white/3"
    >
      <motion.div
        className="mb-6 text-7xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        🌟
      </motion.div>
      <h2 className="mb-3 bg-linear-to-r from-black to-zinc-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-zinc-400">
        Start Your Journey
      </h2>
      <p className="mb-8 max-w-md text-center text-lg text-zinc-600 dark:text-zinc-400">
        Build better habits across Mind, Body, and Soul. Every journey begins
        with a single step.
      </p>
      <motion.button
        onClick={onCreateHabit}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-blue-600 via-red-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-black/10 transition-shadow hover:shadow-xl dark:shadow-white/10"
      >
        <Sparkles className="h-5 w-5" />
        Create Your First Habit
      </motion.button>
    </motion.div>
  );
}

// CreateHabitModal Component
function CreateHabitModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingHabit,
  habits,
  createMutation,
  updateMutation,
  deleteMutation,
  toggleMutation,
  categoryConfig,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: any;
  onSubmit: (e: React.FormEvent) => void;
  editingHabit: number | null;
  habits: any;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  toggleMutation: any;
  categoryConfig: any;
}) {
  if (!isOpen) return null;

  const selectedConfig = categoryConfig[formData.categoryId];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md dark:bg-black/90"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl border border-zinc-200 bg-white/95 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/50">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-black dark:text-white">
                  {editingHabit ? "Edit Habit" : "Create a New Habit"}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {editingHabit
                    ? "Update your habit details below"
                    : "Choose your dimension and define your practice"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Category Selection - Enhanced */}
                <div>
                  <label className="mb-4 block text-sm font-semibold text-black dark:text-white">
                    1. Choose Your Dimension
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["mind", "body", "soul"] as const).map((cat) => {
                      const config = categoryConfig[cat];
                      const Icon = config.icon;
                      const isSelected = formData.categoryId === cat;

                      return (
                        <motion.button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, categoryId: cat })
                          }
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                            isSelected
                              ? `${config.borderColor} ${config.lightBg} shadow-lg ${config.glowColor}`
                              : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50"
                          }`}
                        >
                          {/* Icon Badge */}
                          <motion.div
                            animate={
                              isSelected ? { rotate: [0, 10, -10, 0] } : {}
                            }
                            transition={{ duration: 0.5 }}
                            className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                              isSelected
                                ? config.color
                                : "bg-zinc-100 dark:bg-zinc-700"
                            } shadow-lg`}
                          >
                            <Icon
                              className={`h-7 w-7 ${isSelected ? "text-white" : "text-zinc-400"}`}
                              strokeWidth={2.5}
                            />
                          </motion.div>

                          {/* Label */}
                          <div className="text-center">
                            <span
                              className={`block text-sm font-semibold ${
                                isSelected
                                  ? config.textColor
                                  : "text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              {config.label}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-600">
                              {config.description.split("&")[0]?.trim()}
                            </span>
                          </div>

                          {/* Selected indicator */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full ${config.color}`}
                              >
                                <svg
                                  className="h-3.5 w-3.5 text-white"
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
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Category-specific examples */}
                  {selectedConfig && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`mt-4 rounded-xl ${selectedConfig.lightBg} ${selectedConfig.borderColor} border p-4`}
                    >
                      <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Popular {selectedConfig.label} habits:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedConfig.examples.map((example: string) => (
                          <button
                            key={example}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, name: example })
                            }
                            className={`rounded-full border ${selectedConfig.borderColor} ${selectedConfig.lightBg} px-3 py-1 text-xs font-medium ${selectedConfig.textColor} transition-all hover:shadow-sm`}
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Habit Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                    2. Name Your Habit
                  </label>
                  <motion.input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={`e.g., ${selectedConfig.examples[0]}`}
                    className={`w-full rounded-xl border-2 ${
                      formData.name
                        ? `${selectedConfig.borderColor} ${selectedConfig.lightBg}`
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                    } px-4 py-3.5 text-black placeholder-zinc-400 transition-all focus:border-transparent focus:ring-2 focus:outline-none ${
                      formData.name
                        ? `focus:ring-${selectedConfig.textColor.split("-")[1]}-500/50`
                        : "focus:ring-zinc-300 dark:focus:ring-zinc-600"
                    } dark:text-white dark:placeholder-zinc-500`}
                    autoFocus
                    whileFocus={{ scale: 1.01 }}
                  />
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    Make it specific and actionable
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                    3. Add Context{" "}
                    <span className="font-normal text-zinc-500">
                      (optional)
                    </span>
                  </label>
                  <motion.textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Why is this habit important to you? What will it help you achieve?"
                    rows={3}
                    className={`w-full rounded-xl border-2 ${
                      formData.description
                        ? `${selectedConfig.borderColor} ${selectedConfig.lightBg}`
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                    } px-4 py-3 text-black placeholder-zinc-400 transition-all focus:border-transparent focus:ring-2 focus:outline-none ${
                      formData.description
                        ? `focus:ring-${selectedConfig.textColor.split("-")[1]}-500/50`
                        : "focus:ring-zinc-300 dark:focus:ring-zinc-600"
                    } dark:text-white dark:placeholder-zinc-500`}
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {editingHabit ? (
                    <>
                      {/* Edit mode buttons */}
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              "Delete this habit? This will also delete all completion history.",
                            )
                          ) {
                            deleteMutation.mutate({ id: editingHabit });
                            onClose();
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        {deleteMutation.isPending && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-red-300" />
                        )}
                        Delete
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => {
                          toggleMutation.mutate({ id: editingHabit });
                          onClose();
                        }}
                        disabled={toggleMutation.isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3 font-semibold text-zinc-700 transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {toggleMutation.isPending && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                        )}
                        {habits?.find((h: any) => h.id === editingHabit)
                          ?.isActive
                          ? "Pause"
                          : "Activate"}
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={
                          !formData.name.trim() || updateMutation.isPending
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl ${selectedConfig.color} py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {updateMutation.isPending && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        Update Habit
                      </motion.button>
                    </>
                  ) : (
                    /* Create mode button */
                    <motion.button
                      type="submit"
                      disabled={
                        !formData.name.trim() || createMutation.isPending
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl ${selectedConfig.color} py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {createMutation.isPending && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                      <Sparkles className="h-5 w-5" />
                      Create {selectedConfig.label} Habit
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
