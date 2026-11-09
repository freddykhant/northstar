import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SquiiError } from "../src/api/errors.ts";
import { buildProgram, run } from "../src/cli.ts";
import { VERSION } from "../src/version.ts";

let tmp: string;
let out: string[];
let err: string[];
const savedXdg = process.env.XDG_CONFIG_HOME;
const savedDebug = process.env.SQUII_DEBUG;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "squii-cli-"));
  process.env.XDG_CONFIG_HOME = tmp;
  delete process.env.SQUII_DEBUG;
  out = [];
  err = [];
  vi.spyOn(process.stdout, "write").mockImplementation((s) => (out.push(String(s)), true));
  vi.spyOn(process.stderr, "write").mockImplementation((s) => (err.push(String(s)), true));
  vi.spyOn(console, "error").mockImplementation((...a) => void err.push(a.join(" ")));
});
afterEach(async () => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  if (savedXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = savedXdg;
  if (savedDebug !== undefined) process.env.SQUII_DEBUG = savedDebug;
  await fs.rm(tmp, { recursive: true, force: true });
});

function failing(): Command {
  const p = buildProgram();
  p.command("boom").action(() => {
    throw new SquiiError("x");
  });
  return p;
}

describe("run", () => {
  it("--version prints VERSION to stdout", async () => {
    await run(["node", "squii", "--version"]);
    expect(out.join("")).toBe(`${VERSION}\n`);
    expect(process.exitCode).toBe(0);
  });

  it("prints a friendly one-liner, sets exit code 1, no stack", async () => {
    await run(["node", "squii", "boom"], failing());
    expect(err).toEqual(["x"]);
    expect(process.exitCode).toBe(1);
  });

  it("prints the stack with --debug", async () => {
    await run(["node", "squii", "--debug", "boom"], failing());
    expect(err[0]).toBe("x");
    expect(err.join("\n")).toMatch(/SquiiError: x\s+at /);
    expect(process.exitCode).toBe(1);
  });

  it("prints the stack with SQUII_DEBUG=1", async () => {
    process.env.SQUII_DEBUG = "1";
    await run(["node", "squii", "boom"], failing());
    expect(err.join("\n")).toMatch(/at /);
  });
});
