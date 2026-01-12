"use client";

import {
  ArrowLeft,
  Grid3x3,
  LayoutList,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "~/trpc/react";

type ViewMode = "grid" | "list";

export default function HabitsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingHabit, setEditingHabit] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "mind" as "mind" | "body" | "soul",
  });

  const { data: habits, refetch } = api.habit.getAll.useQuery();

  const createMutation = api.habit.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsModalOpen(false);
      setFormData({ name: "", description: "", categoryId: "mind" });
    },
  });

  const updateMutation = api.habit.update.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingHabit(null);
      setFormData({ name: "", description: "", categoryId: "mind" });
      setIsModalOpen(false);
    },
  });

  const toggleMutation = api.habit.toggleActive.useMutation({
    onSuccess: () => void refetch(),
  });

  const deleteMutation = api.habit.delete.useMutation({
    onSuccess: () => void void refetch(),
  });

  const habitsByCategory = useMemo(() => {
    if (!habits) return { mind: [], body: [], soul: [] };
    return habits.reduce(
      (acc, habit) => {
        const catId = habit.categoryId as "mind" | "body" | "soul";
        acc[catId].push(habit);
        return acc;
      },
      { mind: [], body: [], soul: [] } as Record<
        "mind" | "body" | "soul",
        NonNullable<typeof habits>
      >,
    );
  }, [habits]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-zinc-400">Loading...</div>
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

  const categoryEmojis = {
    mind: "🧠",
    body: "💪",
    soul: "✨",
  };

  const categoryColors = {
    mind: {
      bg: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/20",
      text: "text-blue-400",
      badge: "bg-blue-500/20 text-blue-300",
    },
    body: {
      bg: "from-red-500/10 to-red-600/5",
      border: "border-red-500/20",
      text: "text-red-400",
      badge: "bg-red-500/20 text-red-300",
    },
    soul: {
      bg: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-500/20",
      text: "text-purple-400",
      badge: "bg-purple-500/20 text-purple-300",
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Enhanced Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.4) 0%, transparent 60%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/home"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl font-bold text-transparent">
                  Your Habits
                </span>
              </h1>
              <p className="pl-[60px] text-lg text-zinc-400">
                {habits?.length ?? 0} habit{habits?.length !== 1 ? "s" : ""} ·
                Build the life you want
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/70 p-1 backdrop-blur-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 font-semibold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-zinc-100"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                New Habit
              </button>
            </div>
          </div>
        </div>

        {/* Habits Display */}
        {habits?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/70 p-20 backdrop-blur-xl">
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
        ) : viewMode === "grid" ? (
          <div className="space-y-8">
            {(["mind", "body", "soul"] as const).map((categoryId) => {
              const categoryHabits = habitsByCategory[categoryId];
              if (categoryHabits.length === 0) return null;

              const colors = categoryColors[categoryId];

              return (
                <div key={categoryId}>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold capitalize">
                    <span className="text-3xl">
                      {categoryEmojis[categoryId]}
                    </span>
                    <span className={colors.text}>
                      {categoryId} ({categoryHabits.length})
                    </span>
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryHabits.map((habit) => (
                      <div
                        key={habit.id}
                        onClick={() => openEditModal(habit)}
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-lg ${
                          colors.bg
                        } ${colors.border} ${
                          habit.isActive ? "" : "opacity-50"
                        }`}
                      >
                        <div
                          className={`absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100 ${
                            categoryId === "mind"
                              ? "bg-blue-500/20"
                              : categoryId === "body"
                                ? "bg-red-500/20"
                                : "bg-purple-500/20"
                          }`}
                        />
                        <div className="mb-3 flex items-start justify-between">
                          <h3 className="flex-1 text-lg font-semibold text-white">
                            {habit.name}
                          </h3>
                          {!habit.isActive && (
                            <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                              Paused
                            </span>
                          )}
                        </div>
                        {habit.description && (
                          <p className="text-sm text-zinc-400">
                            {habit.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}
                          >
                            {categoryEmojis[categoryId]} {categoryId}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {habits?.map((habit) => {
              const categoryId = habit.categoryId as "mind" | "body" | "soul";
              const colors = categoryColors[categoryId];

              return (
                <div
                  key={habit.id}
                  onClick={() => openEditModal(habit)}
                  className={`group flex cursor-pointer items-center gap-4 rounded-xl border bg-zinc-900/70 p-5 backdrop-blur-xl transition-all hover:bg-zinc-800/70 hover:shadow-lg ${
                    colors.border
                  } ${habit.isActive ? "" : "opacity-50"}`}
                >
                  <div className="text-3xl">{categoryEmojis[categoryId]}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-zinc-400">
                        {habit.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${colors.badge}`}
                    >
                      {categoryId}
                    </span>
                    {!habit.isActive && (
                      <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs text-zinc-400">
                        Paused
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

                <div>
                  <label className="mb-3 block text-sm font-medium text-white">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["mind", "body", "soul"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, categoryId: cat })
                        }
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 py-4 font-medium transition-all ${
                          formData.categoryId === cat
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                        }`}
                      >
                        <span className="text-2xl">{categoryEmojis[cat]}</span>
                        <span className="text-sm capitalize">{cat}</span>
                      </button>
                    ))}
                  </div>
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
                        className="rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 font-semibold text-red-400 transition-all hover:bg-red-950"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleMutation.mutate({ id: editingHabit });
                          closeModal();
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-semibold text-zinc-300 transition-all hover:bg-zinc-700"
                      >
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
                    className="flex-1 rounded-xl bg-white py-3 font-semibold text-black transition-all hover:bg-zinc-100 disabled:opacity-50"
                  >
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
