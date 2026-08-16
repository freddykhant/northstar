// Guards the failure that shipped in unified-demo.tsx: Tailwind scans source
// text for COMPLETE class names, so `from-${x}-50` generates nothing. It is not
// a type error, not a lint error, and the build succeeds — only a test catches
// it. See the landing uplift brief, finding B.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), "src/_components/landing");

/** Matches a `${...}` inside a className string or clsx-style template. */
const CLASSNAME_INTERPOLATION =
  /className\s*=\s*\{?\s*`[^`]*\$\{[^`]*`/s;

describe("landing components", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} builds no class names by interpolation`, () => {
      const source = readFileSync(join(DIR, file), "utf8");
      expect(CLASSNAME_INTERPOLATION.test(source)).toBe(false);
    });
  }
});
