import { Command, CommanderError } from "commander";
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

export async function run(
  argv: string[],
  program: Command = buildProgram(),
): Promise<void> {
  const debug = argv.includes("--debug") || process.env.SQUII_DEBUG === "1";
  program.exitOverride();
  try {
    await program.parseAsync(argv);
  } catch (err) {
    if (err instanceof CommanderError) {
      // commander has already printed its own output (help, version, usage errors)
      process.exitCode = err.exitCode;
      return;
    }
    console.error(toFriendlyMessage(err, { signedIn: await isSignedIn() }));
    if (debug && err instanceof Error && err.stack) console.error(err.stack);
    process.exitCode = 1;
  }
}
