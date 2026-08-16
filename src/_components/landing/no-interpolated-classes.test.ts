// Guards the failure that shipped in unified-demo.tsx: Tailwind scans source
// text for COMPLETE class names, so `from-${x}-50` generates nothing. It is not
// a type error, not a lint error, and the build succeeds — only a test catches
// it. See the landing uplift brief, finding B.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), "src/_components/landing");

/**
 * Extracts template-literal contents from two contexts where a broken
 * Tailwind class name has actually shipped in this codebase:
 *   (a) directly inside a `className={\`...\`}` JSX attribute, and
 *   (b) assigned to a `const`/`let`/`var` binding whose name contains
 *       "class" or "cls" (e.g. `const cls = \`...\`` or
 *       `const BASE_CLASSNAME = ...`).
 *
 * CSS contexts — inline `style` attribute values, style objects, and
 * bindings whose name doesn't mention "class" — are deliberately NOT
 * scanned. Interpolating a CSS custom property or a `repeat(${n}, ...)`
 * track list is normal and is not a Tailwind class name; flagging it would
 * be a false positive.
 *
 * Within the collected literals, a violation is any interpolation glued to
 * a token across a hyphen: `-${` (e.g. `from-${cat}-50`) or `}-` (e.g.
 * `${prefix}-500`). Interpolation surrounded by whitespace — composing
 * whole class strings, e.g. `${BASE} ${className}` — is legitimate
 * (appending a full external class list) and is not flagged.
 */
const CLASSNAME_AT_SITE = /className\s*=\s*\{\s*`([^`]*)`\s*\}/gs;
const CLASSNAME_BINDING = /\b(?:const|let|var)\s+(\w*)\s*=\s*`([^`]*)`/gs;
const HYPHEN_ADJACENT_INTERPOLATION = /-\$\{|\}-/;

export function hasInterpolatedClassName(source: string): boolean {
  const literals: string[] = [];

  for (const m of source.matchAll(CLASSNAME_AT_SITE)) {
    literals.push(m[1] ?? "");
  }

  for (const m of source.matchAll(CLASSNAME_BINDING)) {
    const [, name, body] = m;
    if (name && /cls|class/i.test(name)) literals.push(body ?? "");
  }

  return literals.some((literal) => HYPHEN_ADJACENT_INTERPOLATION.test(literal));
}

describe("hasInterpolatedClassName (guard self-test)", () => {
  it("flags a className site with hyphen-adjacent interpolation", () => {
    const bad = "const x = <div className={`from-${cat}-50`} />;";
    expect(hasInterpolatedClassName(bad)).toBe(true);
  });

  it("flags a class-named binding with hyphen-adjacent interpolation", () => {
    const bad = "const cls = `text-${size}`;";
    expect(hasInterpolatedClassName(bad)).toBe(true);
  });

  it("does not flag whole-string composition at a className site", () => {
    const good = "const x = <div className={`${BASE} ${className}`} />;";
    expect(hasInterpolatedClassName(good)).toBe(false);
  });

  it("does not flag CSS grid interpolation in a style attribute", () => {
    const good =
      "const x = <div style={{ gridTemplateRows: `repeat(${ROWS}, ${TILE}px)` }} />;";
    expect(hasInterpolatedClassName(good)).toBe(false);
  });

  it("does not flag a CSS custom property interpolation in style", () => {
    const good = "const x = <div style={{ color: `var(--color-${id}-ink)` }} />;";
    expect(hasInterpolatedClassName(good)).toBe(false);
  });

  it("does not flag a non-class-named binding used for CSS", () => {
    const good =
      "const grid = { gridTemplateRows: `repeat(${ROWS}, ${TILE}px)` };";
    expect(hasInterpolatedClassName(good)).toBe(false);
  });
});

describe("landing components", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} builds no class names by interpolation`, () => {
      const source = readFileSync(join(DIR, file), "utf8");
      expect(hasInterpolatedClassName(source)).toBe(false);
    });
  }
});
