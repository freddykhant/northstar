import { Command } from "commander";
import { toFriendlyMessage } from "./api/errors.ts";
import { credentialsPath } from "./config/paths.ts";
import { access } from "node:fs/promises";
import { VERSION } from "./version.ts";

export function buildProgram(): Command {
  return new Command("squii")
    .description("A calm, CLI-first habit tracker.")
    .version(VERSION, "--version", "print the Squii version")
    .option("--debug", "show technical details when something goes wrong");
}

async function isSignedIn(): Promise<boolean> {
  try {
    await access(credentialsPath());
    return true;
  } catch {
    return false;
  }
}

export async function run(argv: string[]): Promise<void> {
  const debug = argv.includes("--debug") || process.env.SQUII_DEBUG === "1";
  try {
    await buildProgram().parseAsync(argv);
  } catch (err) {
    console.error(toFriendlyMessage(err, { signedIn: await isSignedIn() }));
    if (debug && err instanceof Error && err.stack) console.error(err.stack);
    process.exitCode = 1;
  }
}

await run(process.argv);
