import { describe, expect, it } from "vitest";
import {
  activeCategories,
  isPerfectDay,
  tileBackground,
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
