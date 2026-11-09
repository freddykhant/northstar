import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { configDir, credentialsPath } from "./paths.ts";

export type Credentials = {
  apiUrl: string;
  token: string;
  user: { name: string; email: string };
  createdAt: string;
};

function isCredentials(v: unknown): v is Credentials {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  const u = c.user as Record<string, unknown> | null | undefined;
  return (
    typeof c.apiUrl === "string" &&
    typeof c.token === "string" &&
    typeof c.createdAt === "string" &&
    typeof u === "object" &&
    u !== null &&
    typeof u.name === "string" &&
    typeof u.email === "string"
  );
}

export async function readCredentials(
  env: NodeJS.ProcessEnv = process.env,
): Promise<Credentials | null> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(credentialsPath(env), "utf8"));
    return isCredentials(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeCredentials(
  c: Credentials,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const dir = configDir(env);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.chmod(dir, 0o700);
  const tmp = path.join(dir, `.credentials.${randomBytes(6).toString("hex")}.tmp`);
  try {
    await fs.writeFile(tmp, `${JSON.stringify(c, null, 2)}\n`, { mode: 0o600 });
    await fs.chmod(tmp, 0o600);
    await fs.rename(tmp, credentialsPath(env));
  } catch (err) {
    await fs.rm(tmp, { force: true });
    throw err;
  }
}

export async function deleteCredentials(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  await fs.rm(credentialsPath(env), { force: true });
}
