import { deleteCredentials, readCredentials } from "../config/credentials.ts";
import { VERSION } from "../version.ts";

export async function logoutCommand(deps: {
  print(line: string): void;
  env?: NodeJS.ProcessEnv;
}): Promise<void> {
  const creds = await readCredentials(deps.env);
  if (!creds) {
    deps.print("You're not signed in.");
    return;
  }
  try {
    await fetch(`${creds.apiUrl.replace(/\/+$/, "")}/cli/revoke`, {
      method: "POST",
      headers: { authorization: `Bearer ${creds.token}`, "x-squii-version": VERSION },
    });
  } catch {
    // offline is fine; the local sign-out still happens
  }
  await deleteCredentials(deps.env);
  deps.print("Signed out. See you soon.");
}
