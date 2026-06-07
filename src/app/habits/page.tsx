"use client";

import { Plus, X } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HabitsList } from "~/_components/ui/habits-list";
import { Sidebar } from "~/_components/ui/sidebar";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_HEX,
  CATEGORY_IDS,
  CATEGORY_LABELS,
} from "~/lib/constants";
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] text-[var(--color-ink-muted)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark-muted)]">
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

  const handleEdit = (habit: { id: number; name: string; description: string | null; categoryId: string }) => {
    setEditingHabit(habit.id);
    setFormData({
      name: habit.name,
      description: habit.description ?? "",
      categoryId: habit.categoryId as CategoryId,
    });
    setIsModalOpen(true);
  };

  const selectedTint = CATEGORY_HEX[formData.categoryId];

  return (
    <div className="relative flex min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]">
      <Sidebar user={session?.user} />

      <main className="relative flex-1 md:ml-64">
        <div className="mx-auto max-w-3xl px-6 py-16">
          {mutationError && (
            <div className="mb-6 flex items-center justify-between rounded-[6px] border border-[var(--color-ember)]/30 bg-[var(--color-ember)]/8 px-3 py-2 text-[12px] text-[var(--color-ember)]">
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
          <header className="mb-12 flex items-end justify-between">
            <div>
              <h1
                className="font-serif text-[40px] leading-[1.05] font-medium"
                style={{
                  fontOpticalSizing: "auto",
                  letterSpacing: "-0.02em",
                }}
              >
                Habits
              </h1>
              <p className="mt-3 text-[13px] tracking-[0.04em] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                Practices for mind, body, and soul.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-[6px] bg-[var(--color-ink)] px-4 py-2.5 text-[13px] font-medium text-[var(--color-paper)] hover:bg-black dark:bg-[var(--color-ink-dark)] dark:text-[var(--color-paper-dark)] dark:hover:bg-white"
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
            <div className="rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-12 text-center dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
              <h2
                className="mb-2 font-serif text-[22px] font-medium"
                style={{ fontOpticalSizing: "auto" }}
              >
                A blank page
              </h2>
              <p className="mb-6 font-serif text-[14px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                Begin with one practice you can hold for a week.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-paper)] hover:bg-black dark:bg-[var(--color-ink-dark)] dark:text-[var(--color-paper-dark)] dark:hover:bg-white"
              >
                <Plus size={14} weight="bold" />
                Create your first habit
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal — paper sheet */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />
          <div
            className="relative w-full max-w-lg rounded-t-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-7 sm:rounded-[12px] dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 rounded-[4px] p-1.5 text-[var(--color-ink-muted)] hover:bg-black/4 hover:text-[var(--color-ink)] dark:text-[var(--color-ink-dark-muted)] dark:hover:bg-white/6 dark:hover:text-[var(--color-ink-dark)]"
            >
              <X size={16} />
            </button>

            <h2
              className="mb-1 font-serif text-[24px] font-medium"
              style={{ fontOpticalSizing: "auto" }}
            >
              {editingHabit ? "Edit habit" : "New habit"}
            </h2>
            <p className="mb-6 text-[12px] tracking-[0.04em] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
              {editingHabit
                ? "Update the details below."
                : "A category and a name is all you need."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label className="mb-2 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_IDS.map((cat) => {
                    const tint = CATEGORY_HEX[cat];
                    const isSelected = formData.categoryId === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, categoryId: cat })
                        }
                        className={`flex items-center gap-2 rounded-[6px] border px-3 py-2.5 text-left ${
                          isSelected
                            ? "border-[var(--color-ember)] bg-[var(--color-ember)]/8"
                            : "border-black/8 hover:border-black/16 dark:border-white/8 dark:hover:border-white/16"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: tint }}
                        />
                        <span className="text-[13px] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                          {CATEGORY_LABELS[cat]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                  {CATEGORY_DESCRIPTIONS[formData.categoryId]}
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="habit-name"
                  className="mb-2 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]"
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
                  className="w-full rounded-[6px] border border-black/8 bg-transparent px-3 py-2.5 text-[14px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/60 focus:border-[var(--color-ember)] focus:outline-none dark:border-white/8 dark:text-[var(--color-ink-dark)]"
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
                        className="rounded-[4px] border border-black/8 px-2 py-1 text-[11px] text-[var(--color-ink-muted)] hover:border-black/16 hover:text-[var(--color-ink)] dark:border-white/8 dark:text-[var(--color-ink-dark-muted)] dark:hover:border-white/16 dark:hover:text-[var(--color-ink-dark)]"
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
                  className="mb-2 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]"
                >
                  Note <span className="text-[10px] normal-case">(optional)</span>
                </label>
                <textarea
                  id="habit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Why this matters to you."
                  rows={2}
                  className="w-full rounded-[6px] border border-black/8 bg-transparent px-3 py-2.5 text-[13px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/60 focus:border-[var(--color-ember)] focus:outline-none dark:border-white/8 dark:text-[var(--color-ink-dark)]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[6px] border border-black/8 px-4 py-2.5 text-[13px] text-[var(--color-ink-muted)] hover:border-black/16 hover:text-[var(--color-ink)] dark:border-white/8 dark:text-[var(--color-ink-dark-muted)] dark:hover:border-white/16 dark:hover:text-[var(--color-ink-dark)]"
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
                  style={{
                    backgroundColor: editingHabit
                      ? "var(--color-ink)"
                      : selectedTint,
                  }}
                  className="ml-auto rounded-[6px] px-5 py-2.5 text-[13px] font-medium text-[#fbf9f3] hover:opacity-90 disabled:opacity-40"
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
