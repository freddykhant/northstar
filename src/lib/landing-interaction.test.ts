import { describe, expect, it } from "vitest";
import { becamePerfect, toggleCategory } from "./landing-interaction";
import type { DayCategories } from "./types";

const day = (mind: boolean, body: boolean, soul: boolean): DayCategories => ({
  mind,
  body,
  soul,
});

const mapOf = (d: DayCategories) => new Map([["2026-08-16", d]]);

describe("toggleCategory", () => {
  it("turns an unset category on", () => {
    const next = toggleCategory(
      mapOf(day(false, false, false)),
      "2026-08-16",
      "mind",
    );
    expect(next.get("2026-08-16")).toEqual(day(true, false, false));
  });

  it("turns a set category off", () => {
    const next = toggleCategory(
      mapOf(day(true, false, false)),
      "2026-08-16",
      "mind",
    );
    expect(next.get("2026-08-16")).toEqual(day(false, false, false));
  });

  it("does not mutate the input map", () => {
    const before = mapOf(day(false, false, false));
    toggleCategory(before, "2026-08-16", "mind");
    expect(before.get("2026-08-16")).toEqual(day(false, false, false));
  });

  it("treats an unknown key as an empty day rather than throwing", () => {
    const next = toggleCategory(new Map(), "2026-01-01", "soul");
    expect(next.get("2026-01-01")).toEqual(day(false, false, true));
  });
});

describe("becamePerfect", () => {
  it("is true only on the transition into perfect", () => {
    const before = mapOf(day(true, true, false));
    const after = toggleCategory(before, "2026-08-16", "soul");
    expect(becamePerfect(before, after, "2026-08-16")).toBe(true);
  });

  it("is false when leaving perfect", () => {
    const before = mapOf(day(true, true, true));
    const after = toggleCategory(before, "2026-08-16", "soul");
    expect(becamePerfect(before, after, "2026-08-16")).toBe(false);
  });

  it("is false when a non-completing category is added", () => {
    const before = mapOf(day(false, false, false));
    const after = toggleCategory(before, "2026-08-16", "mind");
    expect(becamePerfect(before, after, "2026-08-16")).toBe(false);
  });
});
