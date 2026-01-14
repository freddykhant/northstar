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
      // optimistic updates: cancel pending queries and snapshot current state
      await utils.completion.getForDate.cancel();
      await utils.completion.getStatsForDate.cancel();
      await utils.completion.getMyCompletions.cancel();

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

      const habit = previousHabits?.find((h) => h.id === habitId);
      if (!habit) return { previousHabits, previousStats, previousCompletions };

      const isCompleting = !habit.isCompleted;

      if (previousHabits) {
        utils.completion.getForDate.setData(
          { date: today },
          previousHabits.map((h) =>
            h.id === habitId ? { ...h, isCompleted: !h.isCompleted } : h,
          ),
        );
      }

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

      if (previousCompletions && habit) {
        if (isCompleting) {
          // need to match the exact structure that comes back from server
          // or the graph will break when it tries to render
          const newCompletion = {
            id: Date.now(),
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
            updatedCompletions as any, // eslint-disable-line
          );
        } else {
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

      if (isCompleting) {
        // show animation for 1 second
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
      // something went wrong, rollback all the optimistic updates
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
