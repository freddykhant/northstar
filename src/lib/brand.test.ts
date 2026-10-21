import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EYE_LEFT,
  EYE_RIGHT,
  FIN_LEFT,
  FIN_RIGHT,
  MANTLE_FULL,
  MANTLE_SMALL,
  SQUII,
} from "./squii";

// The favicon is a static SVG, so it cannot import squii.ts and has to
// hand-duplicate the small-tier geometry and hexes. These tests are what
// keep icon.svg pinned to the shared constants instead of silently
// diverging from squii.tsx.
describe("app icon", () => {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");

  const ellipseAttrs = (e: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  }) => `cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}"`;

  const rotateAttr = (fin: { cx: number; cy: number; rotation: number }) =>
    `rotate(${fin.rotation} ${fin.cx} ${fin.cy})`;

  it("carries only Squii's body and ink", () => {
    const hexes = new Set(
      [...svg.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toLowerCase()),
    );
    expect([...hexes].sort()).toEqual([SQUII.body, SQUII.ink].sort());
  });

  it("draws the small-tier mantle, pinned to the shared constant", () => {
    expect(svg).toContain(MANTLE_SMALL);
  });

  it("never draws the full-tier (armed) mantle", () => {
    // The precise "no arms" check: independent of whether arms are drawn
    // with Q, C or L — it fails the moment icon.svg's mantle path diverges
    // from the small-tier constant.
    expect(svg).not.toContain(MANTLE_FULL);
  });

  it("keeps the fin flare, pinned to the shared constants", () => {
    expect(svg).toContain(ellipseAttrs(FIN_LEFT));
    expect(svg).toContain(rotateAttr(FIN_LEFT));
    expect(svg).toContain(ellipseAttrs(FIN_RIGHT));
    expect(svg).toContain(rotateAttr(FIN_RIGHT));
  });

  it("keeps the eyes, pinned to the shared constants", () => {
    expect(svg).toContain(ellipseAttrs(EYE_LEFT));
    expect(svg).toContain(ellipseAttrs(EYE_RIGHT));
  });

  it("renders the small tier — no arms, no smile (belt-and-braces)", () => {
    // The arms are quadratic curves; the smile is the only stroked path.
    // Superseded as the load-bearing check by the MANTLE_FULL exclusion
    // above, but kept as a cheap secondary signal.
    expect(svg).not.toContain("Q");
    expect(svg).not.toContain("stroke");
  });

  it("has exactly 4 ellipses — 2 fins + 2 eyes", () => {
    expect([...svg.matchAll(/<ellipse/g)]).toHaveLength(4);
  });
});
