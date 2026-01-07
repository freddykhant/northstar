"use client";

import { ArrowLeft, Edit2, Plus, Power, Sparkles, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "~/trpc/react";

export default function HabitsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    categoryId: "mind" as "mind" | "body" | "soul",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    categoryId: "mind" as "mind" | "body" | "soul",
  });

  const { data: habits, refetch } = api.habit.getAll.useQuery();
  const { data: categories } = api.category.getAll.useQuery();

  const createMutation = api.habit.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreating(false);
      setNewHabit({ name: "", description: "", categoryId: "mind" });
    },
  });

  const updateMutation = api.habit.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
    },
  });

  const toggleMutation = api.habit.toggleActive.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = api.habit.delete.useMutation({
    onSuccess: () => refetch(),
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;
    createMutation.mutate(newHabit);
  };

  const handleUpdate = (id: number) => {
    if (!editForm.name.trim()) return;
    updateMutation.mutate({
      id,
      name: editForm.name,
      description: editForm.description,
      categoryId: editForm.categoryId,
    });
  };

  const startEdit = (habit: NonNullable<typeof habits>[0]) => {
    setEditingId(habit.id);
    setEditForm({
      name: habit.name,
      description: habit.description ?? "",
      categoryId: habit.categoryId as "mind" | "body" | "soul",
    });
  };

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
        typeof habits
      >,
    );
  }, [habits]);

  const categoryColors = {
    mind: "from-blue-500/20 to-blue-600/10",
    body: "from-red-500/20 to-red-600/10",
    soul: "from-purple-500/20 to-purple-600/10",
  };

  const categoryBorders = {
    mind: "border-blue-500/30 hover:border-blue-500/50",
    body: "border-red-500/30 hover:border-red-500/50",
    soul: "border-purple-500/30 hover:border-purple-500/50",
  };

  const categoryAccents = {
    mind: "text-blue-400",
    body: "text-red-400",
    soul: "text-purple-400",
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,66,0.15)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(120,80,50,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(100,70,50,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/home"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-white">
                <Sparkles className="h-8 w-8 text-yellow-400" />
                Your Habits
              </h1>
              <p className="text-zinc-400">
                Build the life you want, one habit at a time
              </p>
            </div>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 font-semibold text-black transition-all hover:scale-105 hover:bg-zinc-100"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                New Habit
              </button>
            )}
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="mb-8 overflow-hidden rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 p-6 shadow-2xl backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Create New Habit
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) =>
                    setNewHabit({ ...newHabit, name: e.target.value })
                  }
                  placeholder="e.g., Morning Meditation"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Description
                </label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) =>
                    setNewHabit({ ...newHabit, description: e.target.value })
                  }
                  placeholder="Why does this matter to you?"
                  rows={2}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["mind", "body", "soul"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setNewHabit({ ...newHabit, categoryId: cat })
                      }
                      className={`rounded-lg border-2 px-4 py-3 font-medium capitalize transition-all ${
                        newHabit.categoryId === cat
                          ? "border-white bg-white text-black"
                          : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!newHabit.name.trim() || createMutation.isPending}
                  className="flex-1 rounded-lg bg-white px-4 py-2.5 font-semibold text-black transition-all hover:bg-zinc-100 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create Habit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewHabit({
                      name: "",
                      description: "",
                      categoryId: "mind",
                    });
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-2.5 font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Habits Grid */}
        <div className="space-y-8">
          {(["mind", "body", "soul"] as const).map((categoryId) => {
            const categoryHabits = habitsByCategory[categoryId];
            if (categoryHabits.length === 0) return null;

            const category = categories?.find((c) => c.id === categoryId);

            return (
              <div key={categoryId}>
                <h2
                  className={`mb-4 text-lg font-semibold capitalize ${categoryAccents[categoryId]}`}
                >
                  {category?.name ?? categoryId} ({categoryHabits.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {categoryHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm transition-all ${
                        categoryColors[categoryId]
                      } ${categoryBorders[categoryId]} ${
                        habit.isActive
                          ? "border-opacity-100"
                          : "border-opacity-30 opacity-60"
                      }`}
                    >
                      {editingId === habit.id ? (
                        <div className="p-5">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="mb-3 w-full rounded-lg border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-white"
                            autoFocus
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Description..."
                            rows={2}
                            className="mb-3 w-full rounded-lg border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300"
                          />
                          <div className="mb-3 grid grid-cols-3 gap-2">
                            {(["mind", "body", "soul"] as const).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() =>
                                  setEditForm({ ...editForm, categoryId: cat })
                                }
                                className={`rounded border px-2 py-1 text-xs font-medium capitalize transition-all ${
                                  editForm.categoryId === cat
                                    ? "border-white bg-white text-black"
                                    : "border-zinc-600 text-zinc-400"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(habit.id)}
                              disabled={updateMutation.isPending}
                              className="flex-1 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black hover:bg-zinc-100"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-zinc-600 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-5">
                            <div className="mb-2 flex items-start justify-between">
                              <h3 className="flex-1 text-lg font-semibold text-white">
                                {habit.name}
                              </h3>
                              <div
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  habit.isActive
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-zinc-700 text-zinc-400"
                                }`}
                              >
                                {habit.isActive ? "Active" : "Paused"}
                              </div>
                            </div>
                            {habit.description && (
                              <p className="mb-4 text-sm text-zinc-400">
                                {habit.description}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(habit)}
                                className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  toggleMutation.mutate({ id: habit.id })
                                }
                                disabled={toggleMutation.isPending}
                                className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                              >
                                <Power className="h-3.5 w-3.5" />
                                {habit.isActive ? "Pause" : "Activate"}
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete "${habit.name}"? This will also delete all completion history.`,
                                    )
                                  ) {
                                    deleteMutation.mutate({ id: habit.id });
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {habits?.length === 0 && !isCreating && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-16 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
            <h2 className="mb-2 text-2xl font-bold text-white">
              Start Your Journey
            </h2>
            <p className="mb-6 text-zinc-400">
              Create your first habit and begin building momentum
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black transition-transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create Your First Habit
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
