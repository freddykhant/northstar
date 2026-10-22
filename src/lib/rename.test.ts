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

// The rename is user-facing only, so a comment explaining the PREVIOUS
// brand's construction is legitimate — it is the rationale that stops
// someone reintroducing the fragile font-overlay wordmark. Allowed by exact
// line, not by proximity: a second mention added nearby must fail, and
// editing this line must fail, so the exception can never quietly widen.
const ALLOWED_LINES = new Map<string, readonly string[]>([
  [
    "_components/brand/wordmark.tsx",
    [
      "* `northstar` in Plus Jakarta Sans and overlaid a block on the `t` ascender; the",
    ],
  ],
]);

describe("rename to squii", () => {
  const files = ROOTS.flatMap((r) => walk(join(process.cwd(), r)));

  it("finds files to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files) {
    const relPath = file.split("/src/")[1]!;
    it(`${relPath} carries no user-facing "northstar"`, () => {
      const source = readFileSync(file, "utf8");
      const lines = source.split("\n");
      const allowedForFile = ALLOWED_LINES.get(relPath) ?? [];

      const problems: string[] = [];
      for (const [i, line] of lines.entries()) {
        if (!/northstar/i.test(line)) continue;
        if (allowedForFile.includes(line.trim())) continue;

        // The line contains "northstar" and isn't an exact allowlisted
        // line. Distinguish the two ways that can happen so a red build
        // says which one it's looking at: either this file has no
        // allowlist entries at all (a plain new/unexpected hit), or it
        // does but none match verbatim (the allowlisted line drifted, or
        // a second mention appeared nearby).
        const reason =
          allowedForFile.length === 0
            ? "unallowed"
            : "not an exact match for any allowlisted line (drifted wording, or a new mention near an allowlisted one)";
        problems.push(`line ${i + 1} [${reason}]: ${line.trim()}`);
      }

      expect(problems).toEqual([]);
    });
  }
});
