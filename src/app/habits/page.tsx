"use client";

import { Feather, Plus, X } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HabitsList } from "~/_components/ui/habits-list";
import { Card, Pill } from "~/_components/ui/primitives";
import { Sidebar } from "~/_components/ui/sidebar";
import { CATEGORY_DESCRIPTIONS, CATEGORY_IDS } from "~/lib/constants";
import type { CategoryId } from "~/lib/types";
import { api } from "~/trpc/react";

const EXAMPLES: Record<CategoryId, string[]> = {
  mind: ["Read for 30 minutes", "Practice a new language", "Journal thoughts"],
  body: ["Morning workout", "10,000 steps", "Healthy breakfast"],
  soul: ["Meditation session", "Gratitude practice", "Call a loved one"],
};

export default function HabitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "mind" as CategoryId,
  });

  const utils = api.useUtils();
  const { data: habits, isLoading: habitsLoading } =
    api.habit.getAll.useQuery();

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
    setFormData({ name: "", description: "", categoryId: "mind" });
  };

  const createMutation = api.habit.create.useMutation({
    onSuccess: () => {
      void utils.habit.getAll.invalidate();
      closeModal();
    },
    onError: (error) =>
      setMutationError(error.message ?? "Failed to create habit."),
  });

  const updateMutation = api.habit.update.useMutation({
    onMutate: async (variables) => {
      await utils.habit.getAll.cancel();
      const previous = utils.habit.getAll.getData();
      utils.habit.getAll.setData(undefined, (old) =>
        old?.map((h) =>
          h.id === variables.id
            ? {
                ...h,
                name: variables.name,
                description: variables.description ?? null,
                categoryId: variables.categoryId ?? h.categoryId,
              }
            : h,
        ),
      );
      return { previous };
    },
    onSuccess: () => {
      void utils.habit.getAll.invalidate();
      closeModal();
    },
    onError: (error, _v, ctx) => {
      if (ctx?.previous) utils.habit.getAll.setData(undefined, ctx.previous);
      setMutationError(error.message ?? "Failed to update habit.");
    },
  });

  const toggleMutation = api.habit.toggleActive.useMutation({
    onMutate: async (variables) => {
      await utils.habit.getAll.cancel();
      const previous = utils.habit.getAll.getData();
      utils.habit.getAll.setData(undefined, (old) =>
        old?.map((h) =>
          h.id === variables.id ? { ...h, isActive: !h.isActive } : h,
        ),
      );
      return { previous };
    },
    onSuccess: () => void utils.habit.getAll.invalidate(),
    onError: (error, _v, ctx) => {
      if (ctx?.previous) utils.habit.getAll.setData(undefined, ctx.previous);
      setMutationError(error.message ?? "Failed to update habit.");
    },
  });

  const deleteMutation = api.habit.delete.useMutation({
    onMutate: async (variables) => {
      await utils.habit.getAll.cancel();
      const previous = utils.habit.getAll.getData();
      utils.habit.getAll.setData(undefined, (old) =>
        old?.filter((h) => h.id !== variables.id),
      );
      return { previous };
    },
    onSuccess: () => void utils.habit.getAll.invalidate(),
    onError: (error, _v, ctx) => {
      if (ctx?.previous) utils.habit.getAll.setData(undefined, ctx.previous);
      setMutationError(error.message ?? "Failed to delete habit.");
    },
  });

  if (status === "loading" || habitsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] text-[var(--color-ink-muted)]">
        <div className="text-[13px]">Loading…</div>
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
      updateMutation.mutate({ id: editingHabit, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (habit: {
    id: number;
    name: string;
    description: string | null;
    categoryId: string;
  }) => {
    setEditingHabit(habit.id);
    setFormData({
      name: habit.name,
      description: habit.description ?? "",
      categoryId: habit.categoryId as CategoryId,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="relative flex min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Sidebar user={session?.user} />

      <div className="relative flex-1 md:ml-60">
        <main className="mx-auto max-w-4xl px-5 pt-8 pb-24 sm:px-6 lg:px-8">
          {mutationError && (
            <div className="mb-6 flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-body)]/30 bg-[var(--color-body)]/10 px-4 py-3 text-[13px] font-semibold text-[var(--color-body-ink)]">
              <span>{mutationError}</span>
              <button
                onClick={() => setMutationError(null)}
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Page header */}
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-display text-[var(--color-ink)]">Habits</h1>
              <p className="mt-3 text-[13px] tracking-[0.04em] text-[var(--color-ink-muted)]">
                Practices for mind, body, and soul.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--color-canvas)] hover:opacity-90"
            >
              <Plus size={14} weight="bold" />
              New habit
            </button>
          </header>

          {habits && habits.length > 0 ? (
            <HabitsList
              habits={habits}
              onEdit={handleEdit}
              onToggle={(id) => toggleMutation.mutate({ id })}
              onDelete={(id) => deleteMutation.mutate({ id })}
              isToggling={toggleMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
          ) : (
            <Card className="p-12 text-center">
              <Feather
                size={32}
                weight="duotone"
                className="mx-auto mb-4 text-[var(--color-mind)]"
              />
              <h2 className="text-title mb-2 text-[var(--color-ink)]">
                A blank page
              </h2>
              <p className="mb-6 text-[14px] text-[var(--color-ink-muted)]">
                Begin with one practice you can hold for a week.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-canvas)] hover:opacity-90"
              >
                <Plus size={14} weight="bold" />
                Create your first habit
              </button>
            </Card>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-lg rounded-t-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-lift)] sm:rounded-[var(--radius-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 rounded-[var(--radius-control)] p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-sunken)] hover:text-[var(--color-ink)]"
            >
              <X size={16} />
            </button>

            <h2 className="text-title mb-1 text-[var(--color-ink)]">
              {editingHabit ? "Edit habit" : "New habit"}
            </h2>
            <p className="mb-6 text-[12px] tracking-[0.04em] text-[var(--color-ink-muted)]">
              {editingHabit
                ? "Update the details below."
                : "A category and a name is all you need."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label className="mb-2 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_IDS.map((cat) => {
                    const isSelected = formData.categoryId === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setFormData({ ...formData, categoryId: cat })
                        }
                        style={
                          isSelected
                            ? { borderColor: `var(--color-${cat})` }
                            : undefined
                        }
                        className={`flex items-center justify-center rounded-[var(--radius-control)] border px-2 py-2.5 ${
                          isSelected
                            ? ""
                            : "border-[var(--color-hairline)] hover:border-[var(--color-ink-faint)]"
                        }`}
                      >
                        <Pill category={cat} />
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-ink-muted)]">
                  {CATEGORY_DESCRIPTIONS[formData.categoryId]}
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="habit-name"
                  className="mb-2 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase"
                >
                  Name
                </label>
                <input
                  id="habit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={`e.g., ${EXAMPLES[formData.categoryId][0]}`}
                  autoFocus
                  className="w-full rounded-[var(--radius-control)] border border-[var(--color-hairline)] bg-transparent px-3 py-2.5 text-[14px] text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:border-[var(--color-mind)] focus:outline-none"
                />
                {!editingHabit && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {EXAMPLES[formData.categoryId].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, name: example })
                        }
                        className="rounded-[8px] border border-[var(--color-hairline)] px-2 py-1 text-[11px] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="habit-description"
                  className="mb-2 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase"
                >
                  Note{" "}
                  <span className="text-[10px] normal-case">(optional)</span>
                </label>
                <textarea
                  id="habit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Why this matters to you."
                  rows={2}
                  className="w-full rounded-[var(--radius-control)] border border-[var(--color-hairline)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:border-[var(--color-mind)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[var(--radius-control)] border border-[var(--color-hairline)] px-4 py-2.5 text-[13px] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !formData.name.trim() ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="ml-auto rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-canvas)] hover:opacity-90 disabled:opacity-40"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving…"
                    : editingHabit
                      ? "Save"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
