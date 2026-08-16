import { describe, expect, it } from "vitest";
import { MARK_RADIUS_RATIO, markBackground } from "./brand";
import { tileBackground, tileBackgroundCompact } from "./mosaic";

const PERFECT = { mind: true, body: true, soul: true };

describe("markBackground", () => {
  it("derives the resting mark from tileBackground, not a literal", () => {
    expect(markBackground("resting")).toBe(tileBackground(PERFECT));
  });

  it("renders three hard-stop bands on the 135deg axis", () => {
    expect(markBackground("resting")).toContain("135deg");
    expect(markBackground("resting")).toContain("var(--color-mind)");
    expect(markBackground("resting")).toContain("var(--color-body)");
    expect(markBackground("resting")).toContain("var(--color-soul)");
  });

  it("collapses the perfect state to the gold token", () => {
    expect(markBackground("perfect")).toBe(tileBackgroundCompact(PERFECT));
    expect(markBackground("perfect")).toBe("var(--color-perfect)");
  });
});

describe("MARK_RADIUS_RATIO", () => {
  it("is a squircle ratio that scales with the mark", () => {
    expect(MARK_RADIUS_RATIO).toBe(0.28);
    expect(32 * MARK_RADIUS_RATIO).toBeCloseTo(8.96);
  });
});
