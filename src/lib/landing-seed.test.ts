import { describe, expect, it } from "vitest";
import { buildDemoYear, HERO_DAYS, LOPSIDED_MONTH_OFFSET } from "./landing-seed";
import { activeCategories } from "./mosaic";

const REF = new Date(2026, 7, 16); // 16 Aug 2026, fixed

describe("buildDemoYear", () => {
  it("is deterministic across invocations", () => {
    const a = buildDemoYear(REF, HERO_DAYS);
    const b = buildDemoYear(REF, HERO_DAYS);
    expect([...a.entries()]).toEqual([...b.entries()]);
  });

  it("produces exactly the requested number of days, ending on the reference", () => {
    const map = buildDemoYear(REF, HERO_DAYS);
    expect(map.size).toBe(HERO_DAYS);
    expect(map.has("2026-08-16")).toBe(true);
  });

  it("leaves some days empty and makes some days perfect", () => {
    const map = buildDemoYear(REF, HERO_DAYS);
    const counts = [...map.values()].map((d) => activeCategories(d).length);
    expect(counts.some((n) => n === 0)).toBe(true);
    expect(counts.some((n) => n === 3)).toBe(true);
  });

  it("gives a date the same value regardless of window size", () => {
    // The hero asks for 140 days, the comparison 182, the lopsided month 365.
    // All three render on one page, so a date must not change between them.
    const short = buildDemoYear(REF, HERO_DAYS);
    const long = buildDemoYear(REF, 365);
    for (const [key, value] of short) {
      expect(long.get(key)).toEqual(value);
    }
  });

  it("suppresses body in the lopsided month, deliberately not by luck", () => {
    const map = buildDemoYear(REF, 365);
    const target = new Date(
      REF.getFullYear(),
      REF.getMonth() - LOPSIDED_MONTH_OFFSET,
      1,
    );
    const inMonth = [...map.entries()].filter(([key]) => {
      const [y, m] = key.split("-").map(Number);
      return y === target.getFullYear() && m === target.getMonth() + 1;
    });

    expect(inMonth.length).toBeGreaterThan(20);
    const body = inMonth.filter(([, d]) => d.body).length;
    const mind = inMonth.filter(([, d]) => d.mind).length;
    const soul = inMonth.filter(([, d]) => d.soul).length;

    expect(body * 3).toBeLessThan(mind);
    expect(body * 3).toBeLessThan(soul);
  });
});
