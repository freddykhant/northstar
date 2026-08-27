import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasInterpolatedClassName } from "../landing/no-interpolated-classes.test";

const DIR = join(process.cwd(), "src/_components/brand");

describe("brand components", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} builds no class names by interpolation`, () => {
      expect(hasInterpolatedClassName(readFileSync(join(DIR, file), "utf8"))).toBe(false);
    });
  }
});
