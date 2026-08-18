import { describe, expect, it } from "vitest";
import {
  buildDemoYear,
  HERO_DAYS,
  LOPSIDED_MONTH_OFFSET,
  parseDayKey,
} from "./landing-seed";
import { activeCategories } from "./mosaic";
import { formatDateAsLocal } from "./utils";

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

// Regression guard for the hydration mismatch: the landing page used to thread
// a `Date` from the server into a `"use client"` component. That prop crosses
// the RSC boundary as an INSTANT, and both sides then read it with LOCAL
// getFullYear/getMonth/getDate — so a UTC server and a US-Eastern visitor
// disagreed about the calendar day for five hours every evening, shifting all
// 140 tiles and mismatching every aria-label and inline background.
//
// The fix is to thread a zone-free `YYYY-MM-DD` key instead. These tests pin
// the property that makes that work: the demo year is a function of the KEY,
// never of an instant or of the ambient zone.
describe("parseDayKey", () => {
  it("round-trips with formatDateAsLocal", () => {
    for (const key of [
      "2026-08-16",
      "2026-01-01",
      "2025-12-31",
      "2024-02-29",
    ]) {
      expect(formatDateAsLocal(parseDayKey(key))).toBe(key);
    }
  });

  it("yields local midnight, so calendar fields never straddle a day", () => {
    const d = parseDayKey("2026-08-16");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 7, 16]);
    expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([0, 0, 0]);
  });

  it("rejects a malformed key rather than silently drifting", () => {
    for (const bad of ["", "2026-8-16", "2026-08-16T00:00:00Z", "not-a-date"]) {
      expect(() => parseDayKey(bad)).toThrow(RangeError);
    }
  });

  it("depends only on the key, not on the ambient timezone", () => {
    const KEY = "2026-08-16";
    const original = process.env.TZ;
    const snapshots: string[] = [];

    try {
      for (const tz of ["UTC", "America/New_York", "Asia/Tokyo"]) {
        process.env.TZ = tz;
        const map = buildDemoYear(parseDayKey(KEY), HERO_DAYS);
        snapshots.push(JSON.stringify([...map.entries()]));
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }

    expect(snapshots[0]).toBe(snapshots[1]);
    expect(snapshots[1]).toBe(snapshots[2]);
    expect(JSON.parse(snapshots[0]!)).toHaveLength(HERO_DAYS);
  });

  it("makes the last tile the reference day itself, not a neighbour", () => {
    // The instant-based version could land on either side of midnight; the
    // key-based one cannot.
    const KEY = "2026-08-16";
    const keys = [...buildDemoYear(parseDayKey(KEY), HERO_DAYS).keys()];
    expect(keys.at(-1)).toBe(KEY);
  });
});
