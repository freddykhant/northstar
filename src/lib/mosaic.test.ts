import { describe, expect, it } from "vitest";
import {
  activeCategories,
  isPerfectDay,
  keptLabel,
  tileBackground,
  tileBackgroundCompact,
  type DayCategories,
} from "./mosaic";

const day = (
  mind: boolean,
  body: boolean,
  soul: boolean,
): DayCategories => ({ mind, body, soul });

describe("tileBackground", () => {
  it("renders an empty day as the sunken token", () => {
    expect(tileBackground(day(false, false, false))).toBe(
      "var(--color-tile-empty)",
    );
  });

  it("renders a single category as a solid colour", () => {
    expect(tileBackground(day(true, false, false))).toBe("var(--color-mind)");
    expect(tileBackground(day(false, true, false))).toBe("var(--color-body)");
    expect(tileBackground(day(false, false, true))).toBe("var(--color-soul)");
  });

  it("splits two categories into equal halves at 135 degrees", () => {
    expect(tileBackground(day(true, true, false))).toBe(
      "linear-gradient(135deg, var(--color-mind) 0% 50%, var(--color-body) 50% 100%)",
    );
    expect(tileBackground(day(true, false, true))).toBe(
      "linear-gradient(135deg, var(--color-mind) 0% 50%, var(--color-soul) 50% 100%)",
    );
    expect(tileBackground(day(false, true, true))).toBe(
      "linear-gradient(135deg, var(--color-body) 0% 50%, var(--color-soul) 50% 100%)",
    );
  });

  it("splits three categories into equal thirds in mind/body/soul order", () => {
    expect(tileBackground(day(true, true, true))).toBe(
      "linear-gradient(135deg, var(--color-mind) 0% 33.333%, var(--color-body) 33.333% 66.667%, var(--color-soul) 66.667% 100%)",
    );
  });
});

describe("tileBackgroundCompact", () => {
  it("collapses a perfect day to the perfect token", () => {
    expect(tileBackgroundCompact(day(true, true, true))).toBe(
      "var(--color-perfect)",
    );
  });

  it("matches tileBackground exactly for every non-perfect state", () => {
    const nonPerfectDays: DayCategories[] = [
      day(false, false, false),
      day(true, false, false),
      day(false, true, false),
      day(false, false, true),
      day(true, true, false),
      day(true, false, true),
      day(false, true, true),
    ];

    for (const c of nonPerfectDays) {
      expect(tileBackgroundCompact(c)).toBe(tileBackground(c));
    }
  });
});

describe("isPerfectDay", () => {
  it("is true only when all three categories are kept", () => {
    expect(isPerfectDay(day(true, true, true))).toBe(true);
    expect(isPerfectDay(day(true, true, false))).toBe(false);
    expect(isPerfectDay(day(false, false, false))).toBe(false);
  });
});

describe("activeCategories", () => {
  it("returns kept categories in mind/body/soul order", () => {
    expect(activeCategories(day(false, true, true))).toEqual(["body", "soul"]);
    expect(activeCategories(day(true, false, false))).toEqual(["mind"]);
    expect(activeCategories(day(false, false, false))).toEqual([]);
  });
});

describe("keptLabel", () => {
  it("returns 'Nothing kept' when none are set", () => {
    expect(keptLabel(day(false, false, false))).toBe("Nothing kept");
  });

  it("labels a single kept category", () => {
    expect(keptLabel(day(true, false, false))).toBe("Mind");
    expect(keptLabel(day(false, true, false))).toBe("Body");
    expect(keptLabel(day(false, false, true))).toBe("Soul");
  });

  it("joins two kept categories in mind/body/soul order", () => {
    expect(keptLabel(day(true, false, true))).toBe("Mind, Soul");
    expect(keptLabel(day(false, true, true))).toBe("Body, Soul");
  });

  it("joins all three kept categories in mind/body/soul order", () => {
    expect(keptLabel(day(true, true, true))).toBe("Mind, Body, Soul");
  });
});
