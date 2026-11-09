import os from "node:os";
import path from "node:path";

export function configDir(env: NodeJS.ProcessEnv = process.env, home: string = os.homedir()): string {
  const xdg = env.XDG_CONFIG_HOME;
  const base = xdg && xdg.length > 0 ? xdg : path.join(home, ".config");
  return path.join(base, "squii");
}

export function credentialsPath(env: NodeJS.ProcessEnv = process.env): string {
  return path.join(configDir(env), "credentials.json");
}
