import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The rename is user-facing only: internal identifiers, package name and DB
// tables deliberately stay. This catches the visible strings — one stray page
// title or alt text survives a rename silently otherwise.
const ROOTS = ["src/app", "src/_components"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory()
      ? walk(full)
      : /\.tsx?$/.test(entry)
        ? [full]
        : [];
  });
}

// Context strings that, when found immediately before a match, mean the hit
// is legitimate and should not be flagged. Keep this narrow and explicit —
// broadening the regex instead would let real misses through silently.
const ALLOWED_CONTEXTS = [
  // A code comment referencing a docs/ path.
  "docs/",
  // brand/wordmark.tsx: a comment explicitly documenting the *previous*
  // brand's design (a webfont wordmark reading "northstar") as the reason
  // the new mark is hand-drawn instead. This is a historical reference, not
  // a stale rename — it must keep saying "northstar" to be accurate.
  "The previous brand set",
];

describe("rename to squii", () => {
  const files = ROOTS.flatMap((r) => walk(join(process.cwd(), r)));

  it("finds files to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files) {
    it(`${file.split("/src/")[1]} carries no user-facing "northstar"`, () => {
      const source = readFileSync(file, "utf8");
      const hits = [...source.matchAll(/northstar/gi)].filter((m) => {
        const before = source.slice(Math.max(0, m.index - 90), m.index);
        return !ALLOWED_CONTEXTS.some((ctx) => before.includes(ctx));
      });
      expect(hits.map((m) => m[0])).toEqual([]);
    });
  }
});
