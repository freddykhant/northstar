import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MARK_RADIUS_RATIO, markBackground } from "./brand";
import { CATEGORY_HEX_LIGHT } from "./constants";
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

// The favicon is a static SVG, so it cannot read CSS custom properties and has
// to hardcode the three category hexes. Nothing checked them, which means the
// palette could move and the browser-tab mark would quietly keep the old
// colours — the one surface nobody looks at while editing tokens. This pins
// the SVG's gradient stops to CATEGORY_HEX_LIGHT.
describe("app icon", () => {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");

  it("paints its gradient from the light category hexes, in order", () => {
    const stops = [...svg.matchAll(/stop-color="(#[0-9a-fA-F]{6})"/g)].map(
      (m) => m[1]!.toLowerCase(),
    );

    // Six stops, not three: each colour is repeated to make a hard band edge
    // rather than a blend.
    expect(stops).toEqual([
      CATEGORY_HEX_LIGHT.mind,
      CATEGORY_HEX_LIGHT.mind,
      CATEGORY_HEX_LIGHT.body,
      CATEGORY_HEX_LIGHT.body,
      CATEGORY_HEX_LIGHT.soul,
      CATEGORY_HEX_LIGHT.soul,
    ]);
  });

  it("carries no hex outside the category set", () => {
    const hexes = new Set(
      [...svg.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toLowerCase()),
    );
    expect([...hexes].sort()).toEqual(
      [
        CATEGORY_HEX_LIGHT.mind,
        CATEGORY_HEX_LIGHT.body,
        CATEGORY_HEX_LIGHT.soul,
      ].sort(),
    );
  });
});
