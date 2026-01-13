"use client";

import { Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GradientBackground } from "~/_components/ui/gradient-background";
import { HabitsList } from "~/_components/ui/habits-list";
import { NorthstarHeader } from "~/_components/ui/northstar-header";
import { api } from "~/trpc/react";

export default function HabitsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "mind" as "mind" | "body" | "soul",
  });

  const utils = api.useUtils();
  const { data: habits, isLoading: habitsLoading } = api.habit.getAll.useQuery();

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
                description: variables.description,
                categoryId: variables.categoryId,
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
        <NorthstarHeader />
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

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0c0c0c]">
      {/* Background */}
      <GradientBackground />

      {/* Header */}
      <NorthstarHeader />

      {/* Content */}
      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold text-white">
              Your Habits
            </h1>
            <p className="text-sm text-zinc-400">
              Manage your daily practices across all dimensions
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.08] px-4 py-2 text-sm text-white transition-all hover:bg-white/[0.12]"
          >
            <Plus className="h-4 w-4" />
            Add Habit
          </button>
        </div>

        {habits && habits.length > 0 ? (
          <HabitsList
            habits={habits}
            onEdit={openEditModal}
            onToggle={(id) => toggleMutation.mutate({ id })}
            onDelete={(id) => deleteMutation.mutate({ id })}
            isToggling={toggleMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.03] p-20 backdrop-blur-sm">
            <div className="mb-6 text-7xl">🌟</div>
            <h2 className="mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-3xl font-bold text-transparent">
              Start Your Journey
            </h2>
            <p className="mb-8 text-center text-lg text-zinc-400">
              Create your first habit and begin building momentum
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-black shadow-lg shadow-white/10 transition-transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create Your First Habit
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="mb-1 text-2xl font-bold text-white">
                  {editingHabit ? "Edit Habit" : "Create New Habit"}
                </h2>
                <p className="text-sm text-zinc-400">
                  {editingHabit
                    ? "Update your habit details"
                    : "Start building a new routine"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Selection - First */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-white">
                    Choose Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["mind", "body", "soul"] as const).map((cat) => {
                      const isSelected = formData.categoryId === cat;
                      const glowColors = {
                        mind: "shadow-blue-500/50",
                        body: "shadow-red-500/50",
                        soul: "shadow-purple-500/50",
                      };
                      const hoverGlow = {
                        mind: "hover:shadow-blue-500/30",
                        body: "hover:shadow-red-500/30",
                        soul: "hover:shadow-purple-500/30",
                      };
                      const hoverBorder = {
                        mind: "hover:border-blue-500/50",
                        body: "hover:border-red-500/50",
                        soul: "hover:border-purple-500/50",
                      };
                      const radialGradient = {
                        mind: "radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
                        body: "radial-gradient(circle at center, rgba(239, 68, 68, 0.08) 0%, transparent 70%)",
                        soul: "radial-gradient(circle at center, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
                      };

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, categoryId: cat })
                          }
                          className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 py-5 transition-all ${
                            isSelected
                              ? `border-white shadow-lg ${glowColors[cat]}`
                              : `border-zinc-700 bg-zinc-900 hover:shadow-md ${hoverBorder[cat]} ${hoverGlow[cat]}`
                          }`}
                          style={
                            !isSelected
                              ? {
                                  background: `${radialGradient[cat]}, rgb(24 24 27)`,
                                }
                              : undefined
                          }
                        >
                          {/* Icon */}
                          <div className="flex h-12 w-12 items-center justify-center drop-shadow-lg">
                            <Image
                              src={`/${cat}.svg`}
                              alt={cat}
                              width={48}
                              height={48}
                              className="transition-all group-hover:scale-110"
                            />
                          </div>

                          {/* Label */}
                          <span
                            className={`text-sm font-semibold capitalize transition-all ${
                              isSelected ? "text-white" : "text-zinc-300"
                            }`}
                          >
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Habit Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Morning Meditation"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Why does this matter to you?"
                    rows={3}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {editingHabit && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              "Delete this habit? This will also delete all completion history.",
                            )
                          ) {
                            deleteMutation.mutate({ id: editingHabit });
                            closeModal();
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-2 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 font-semibold text-red-400 transition-all hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteMutation.isPending && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-red-300" />
                        )}
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleMutation.mutate({ id: editingHabit });
                          closeModal();
                        }}
                        disabled={toggleMutation.isPending}
                        className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-semibold text-zinc-300 transition-all hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {toggleMutation.isPending && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                        )}
                        {habits?.find((h) => h.id === editingHabit)?.isActive
                          ? "Pause"
                          : "Activate"}
                      </button>
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={
                      !formData.name.trim() ||
                      createMutation.isPending ||
                      updateMutation.isPending
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
                    )}
                    {editingHabit ? "Update Habit" : "Create Habit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
