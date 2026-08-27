import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SQUII } from "./squii";

// The favicon is a static SVG, so it cannot read CSS custom properties and has
// to hardcode Squii's hexes. Nothing else checks them, which means the brand
// could move and the browser-tab mark would quietly keep the old colours.
describe("app icon", () => {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");

  it("carries only Squii's body and ink", () => {
    const hexes = new Set(
      [...svg.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toLowerCase()),
    );
    expect([...hexes].sort()).toEqual([SQUII.body, SQUII.ink].sort());
  });

  it("renders the small tier — no arms, no smile", () => {
    // The arms are quadratic curves; the smile is the only stroked path.
    expect(svg).not.toContain("Q");
    expect(svg).not.toContain("stroke");
  });

  it("keeps the fin flare, which is what makes him a squid", () => {
    expect([...svg.matchAll(/<ellipse/g)]).toHaveLength(4); // 2 fins + 2 eyes
    expect(svg).toContain("rotate(-27");
    expect(svg).toContain("rotate(27");
  });
});
