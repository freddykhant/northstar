import { describe, expect, it } from "vitest";
import { addDays, daysBetween, isLocalDate, localToday } from "../src/dates.ts";

describe("dates", () => {
  it("validates", () => {
    expect(isLocalDate("2026-02-29")).toBe(false);
    expect(isLocalDate("2028-02-29")).toBe(true);
    expect(isLocalDate("2026-1-05")).toBe(false);
  });
  it("adds days", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("diffs days across DST", () => {
    expect(daysBetween("2026-10-25", "2026-10-26")).toBe(1);
  });
  it("gives local today", () => {
    expect(localToday(new Date(2026, 10, 9, 23, 59))).toBe("2026-11-09");
  });
});
