/**
 * Shared TypeScript types and interfaces
 */

export type CategoryId = "mind" | "body" | "soul";

export interface DayData {
  date: string;
  categories: {
    mind: boolean;
    body: boolean;
    soul: boolean;
  };
}

export interface MonthLabel {
  month: string;
  startIndex: number;
}

export interface HabitWithStatus {
  id: number;
  name: string;
  description: string | null;
  categoryId: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  isCompleted: boolean;
  category: {
    id: string;
    name: string;
  };
}

export interface CategoryStats {
  category: {
    id: string;
    name: string;
  };
  count: number;
}

export interface DayStats {
  totalCompletions: number;
  byCategory: CategoryStats[];
}
