import { describe, expect, it } from "vitest";
import { computeStats } from "../src/stats.ts";

const today = "2026-11-09";
describe("computeStats", () => {
  it("empty", () => {
    expect(computeStats({ inkedDates: [], today, activeHabitCount: 3 }))
      .toEqual({ currentStreak: 0, bestStreak: 0, totalInked: 0, weekPercent: 0 });
  });
  it("streak survives an un-inked today", () => {
    expect(computeStats({ inkedDates: ["2026-11-07", "2026-11-08"], today, activeHabitCount: 1 }).currentStreak).toBe(2);
  });
  it("a gap breaks it", () => {
    expect(computeStats({ inkedDates: ["2026-11-06", "2026-11-08", "2026-11-09"], today, activeHabitCount: 1 }).currentStreak).toBe(2);
  });
  it("best streak across year boundary", () => {
    expect(computeStats({ inkedDates: ["2025-12-30", "2025-12-31", "2026-01-01", "2026-01-01"], today, activeHabitCount: 2 }).bestStreak).toBe(3);
  });
  it("week percent", () => {
    expect(computeStats({ inkedDates: ["2026-11-03", "2026-11-09", "2026-11-09", "2026-11-02"], today, activeHabitCount: 2 }).weekPercent).toBe(21);
    expect(computeStats({ inkedDates: Array(20).fill(today), today, activeHabitCount: 1 }).weekPercent).toBe(100);
    expect(computeStats({ inkedDates: [today], today, activeHabitCount: 0 }).weekPercent).toBe(0);
  });
});
