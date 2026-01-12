/**
 * Utility and helper functions
 */

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const date = new Date();
  return date.toISOString().split("T")[0]!;
}

/**
 * Get a time-based greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get date range for the current year (Jan 1 - Dec 31)
 */
export function getCurrentYearRange(): { startDate: string; endDate: string } {
  const currentYear = getCurrentYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  return {
    startDate: startOfYear.toISOString().split("T")[0]!,
    endDate: endOfYear.toISOString().split("T")[0]!,
  };
}

/**
 * Generate all days in the current year
 */
export function getAllDaysInCurrentYear(): string[] {
  const result: string[] = [];
  const currentYear = getCurrentYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const current = new Date(startOfYear);
  while (current <= endOfYear) {
    result.push(current.toISOString().split("T")[0]!);
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(
  completed: number,
  total: number,
): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Normalize date string to ensure consistent format
 */
export function normalizeDateString(date: unknown): string {
  if (typeof date === "string") return date;
  if (date instanceof Date) return date.toISOString().split("T")[0]!;
  return String(date).split("T")[0]!;
}
