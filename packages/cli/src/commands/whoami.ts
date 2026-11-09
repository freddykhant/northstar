import { SquiiError } from "../api/errors.ts";
import { createApiClient } from "../api/client.ts";
import { readCredentials } from "../config/credentials.ts";

export async function whoamiCommand(deps: {
  print(line: string): void;
  env?: NodeJS.ProcessEnv;
}): Promise<void> {
  const creds = await readCredentials(deps.env);
  if (!creds) throw new SquiiError("You're not signed in yet. Run `squii login`.");
  const me = await createApiClient({ baseUrl: creds.apiUrl, token: creds.token }).me.whoami.query();
  deps.print(`${me.name} (${me.email})`);
}
