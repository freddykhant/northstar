import open from "open";
import { login } from "../auth/login.ts";
import { apiUrl } from "../version.ts";

export async function loginCommand(deps: {
  print(line: string): void;
  apiUrl?: string;
  openBrowser?: (url: string) => Promise<void>;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
}): Promise<void> {
  await login({
    apiUrl: deps.apiUrl ?? apiUrl(),
    openBrowser: deps.openBrowser ?? (async (url) => void (await open(url))),
    print: deps.print,
    timeoutMs: deps.timeoutMs,
    env: deps.env,
  });
}
