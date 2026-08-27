import { describe, expect, it } from "vitest";
import { SQUII, tierForSize } from "./squii";
import { CATEGORY_HEX_LIGHT } from "./constants";

describe("SQUII colours", () => {
  it("pins the measured brand values", () => {
    expect(SQUII.body).toBe("#fdb6c0");
    expect(SQUII.ink).toBe("#31356b");
    expect(SQUII.ground).toBe("#be9fe0");
    expect(SQUII.gold).toBe("#d4a017");
  });

  it("uses no category hue as its body", () => {
    const cats = Object.values(CATEGORY_HEX_LIGHT);
    expect(cats).not.toContain(SQUII.body);
  });
});

describe("tierForSize", () => {
  it("drops detail at and below 19px", () => {
    expect(tierForSize(19)).toBe("small");
    expect(tierForSize(16)).toBe("small");
  });

  it("keeps full detail from 20px up", () => {
    expect(tierForSize(20)).toBe("full");
    expect(tierForSize(32)).toBe("full");
    expect(tierForSize(150)).toBe("full");
  });

  it("has no gap or overlap at the boundary", () => {
    expect(tierForSize(19)).not.toBe(tierForSize(20));
  });
});
