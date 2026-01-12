/**
 * Custom hook for handling habit completion with optimistic updates
 */

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface UseHabitCompletionOptions {
  today: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function useHabitCompletion({
  today,
  dateRange,
}: UseHabitCompletionOptions) {
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set());
  const utils = api.useUtils();

  const toggleMutation = api.completion.toggle.useMutation({
    onMutate: async ({ habitId }) => {
      // Cancel outgoing refetches
      await utils.completion.getForDate.cancel();
      await utils.completion.getStatsForDate.cancel();
      await utils.completion.getMyCompletions.cancel();

      // Snapshot the previous values
      const previousHabits = utils.completion.getForDate.getData({
        date: today,
      });
      const previousStats = utils.completion.getStatsForDate.getData({
        date: today,
      });
      const previousCompletions = utils.completion.getMyCompletions.getData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      // Find the habit being toggled
      const habit = previousHabits?.find((h) => h.id === habitId);
      if (!habit) return { previousHabits, previousStats, previousCompletions };

      const isCompleting = !habit.isCompleted;

      // Optimistically update habits
      if (previousHabits) {
        utils.completion.getForDate.setData(
          { date: today },
          previousHabits.map((h) =>
            h.id === habitId ? { ...h, isCompleted: !h.isCompleted } : h,
          ),
        );
      }

      // Optimistically update stats
      if (previousStats && habit) {
        const categoryId = habit.category.id;
        const updatedByCategory = previousStats.byCategory.map((cat) => {
          if (cat.category.id === categoryId) {
            return {
              ...cat,
              count: isCompleting ? cat.count + 1 : cat.count - 1,
            };
          }
          return cat;
        });

        utils.completion.getStatsForDate.setData(
          { date: today },
          {
            ...previousStats,
            totalCompletions: isCompleting
              ? previousStats.totalCompletions + 1
              : previousStats.totalCompletions - 1,
            byCategory: updatedByCategory,
          },
        );
      }

      // Optimistically update graph data
      if (previousCompletions && habit) {
        if (isCompleting) {
          // Add completion to graph with proper structure matching server response
          const newCompletion = {
            id: Date.now(), // temporary ID
            habitId: habitId,
            userId: habit.userId,
            completedDate: today,
            createdAt: new Date(),
            habit: {
              id: habit.id,
              name: habit.name,
              description: habit.description,
              categoryId: habit.category.id,
              userId: habit.userId,
              isActive: habit.isActive,
              createdAt: habit.createdAt,
              category: {
                id: habit.category.id,
                name: habit.category.name,
              },
            },
          };

          const updatedCompletions = [...previousCompletions, newCompletion];

          utils.completion.getMyCompletions.setData(
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
            updatedCompletions as any,
          );
        } else {
          // Remove completion from graph
          const filteredCompletions = previousCompletions.filter(
            (c) => !(c.habitId === habitId && c.completedDate === today),
          );

          utils.completion.getMyCompletions.setData(
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
            filteredCompletions,
          );
        }
      }

      // Show completion animation
      if (isCompleting) {
        setJustCompleted((prev) => new Set(prev).add(habitId));
        setTimeout(() => {
          setJustCompleted((prev) => {
            const next = new Set(prev);
            next.delete(habitId);
            return next;
          });
        }, 1000);
      }

      return { previousHabits, previousStats, previousCompletions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousHabits) {
        utils.completion.getForDate.setData(
          { date: today },
          context.previousHabits,
        );
      }
      if (context?.previousStats) {
        utils.completion.getStatsForDate.setData(
          { date: today },
          context.previousStats,
        );
      }
      if (context?.previousCompletions) {
        utils.completion.getMyCompletions.setData(
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
          context.previousCompletions,
        );
      }
    },
    onSuccess: () => {
      // Refetch to sync with server
      void utils.completion.getForDate.invalidate({ date: today });
      void utils.completion.getStatsForDate.invalidate({ date: today });
      void utils.completion.getMyCompletions.invalidate({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    },
  });

  const handleToggle = (habitId: number) => {
    toggleMutation.mutate({ habitId, date: today });
  };

  return {
    toggleMutation,
    handleToggle,
    justCompleted,
  };
}
