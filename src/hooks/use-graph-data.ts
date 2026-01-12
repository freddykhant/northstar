/**
 * Custom hook for transforming completion data into graph format
 */

"use client";

import { useMemo } from "react";
import type { CategoryId, DayData } from "~/lib/types";

interface CompletionData {
  completedDate: string;
  habit: {
    category: {
      id: string;
    };
  };
}

export function useGraphData(completionsData: CompletionData[] | undefined): DayData[] {
  return useMemo(() => {
    if (!completionsData) return [];

    // Group completions by date and category
    const dataByDate = new Map<
      string,
      { mind: boolean; body: boolean; soul: boolean }
    >();

    completionsData.forEach((completion) => {
      const dateKey = completion.completedDate;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { mind: false, body: false, soul: false });
      }
      const categoryId = completion.habit.category.id as CategoryId;
      dataByDate.get(dateKey)![categoryId] = true;
    });

    // Convert to array format
    return Array.from(dataByDate.entries()).map(([date, categories]) => ({
      date,
      categories,
    }));
  }, [completionsData]);
}
