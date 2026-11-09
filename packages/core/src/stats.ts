import { addDays, daysBetween, type LocalDate } from "./dates.ts";

export type Stats = {
  currentStreak: number;
  bestStreak: number;
  totalInked: number;
  weekPercent: number;
};

export function computeStats(input: {
  inkedDates: LocalDate[];
  today: LocalDate;
  activeHabitCount: number;
}): Stats {
  const { inkedDates, today, activeHabitCount } = input;
  const days = [...new Set(inkedDates)].sort();
  const daySet = new Set(days);

  let bestStreak = 0;
  let run = 0;
  let prev: LocalDate | undefined;
  for (const d of days) {
    run = prev !== undefined && daysBetween(prev, d) === 1 ? run + 1 : 1;
    if (run > bestStreak) bestStreak = run;
    prev = d;
  }

  let cursor = daySet.has(today) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (daySet.has(cursor)) {
    currentStreak++;
    cursor = addDays(cursor, -1);
  }

  const weekStart = addDays(today, -6);
  const weekInks = inkedDates.filter((d) => d >= weekStart && d <= today).length;
  const weekPercent =
    activeHabitCount > 0
      ? Math.min(100, Math.round((100 * weekInks) / (7 * activeHabitCount)))
      : 0;

  return { currentStreak, bestStreak, totalInked: inkedDates.length, weekPercent };
}
