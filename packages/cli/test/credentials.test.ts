import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  deleteCredentials,
  readCredentials,
  writeCredentials,
  type Credentials,
} from "../src/config/credentials.ts";
import { configDir } from "../src/config/paths.ts";

const creds: Credentials = {
  apiUrl: "https://example.test",
  token: "sq_abc",
  user: { name: "Ada", email: "ada@example.test" },
  createdAt: "2026-11-09T00:00:00.000Z",
};

let tmp: string;
let env: NodeJS.ProcessEnv;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "squii-cred-"));
  env = { XDG_CONFIG_HOME: tmp };
});
afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

describe("credentials", () => {
  it("configDir honours XDG_CONFIG_HOME, else ~/.config/squii", () => {
    expect(configDir({ XDG_CONFIG_HOME: "/x" }, "/home/u")).toBe("/x/squii");
    expect(configDir({}, "/home/u")).toBe("/home/u/.config/squii");
    expect(configDir({ XDG_CONFIG_HOME: "" }, "/home/u")).toBe("/home/u/.config/squii");
  });

  it("write then read round-trips", async () => {
    await writeCredentials(creds, env);
    expect(await readCredentials(env)).toEqual(creds);
  });

  it("file is 0600 and dir is 0700", async () => {
    const dir = configDir(env);
    await fs.mkdir(dir, { mode: 0o755 });
    await fs.chmod(dir, 0o755);
    await writeCredentials(creds, env);
    expect((await fs.stat(dir)).mode & 0o777).toBe(0o700);
    expect((await fs.stat(path.join(dir, "credentials.json"))).mode & 0o777).toBe(0o600);
  });

  it("a corrupt file reads as null", async () => {
    expect(await readCredentials(env)).toBeNull();
    await writeCredentials(creds, env);
    const file = path.join(configDir(env), "credentials.json");
    await fs.writeFile(file, "{nope");
    expect(await readCredentials(env)).toBeNull();
    await fs.writeFile(file, JSON.stringify({ token: 1 }));
    expect(await readCredentials(env)).toBeNull();
  });

  it("write leaves no temp file behind", async () => {
    await writeCredentials(creds, env);
    await writeCredentials({ ...creds, token: "sq_def" }, env);
    expect(await fs.readdir(configDir(env))).toEqual(["credentials.json"]);
  });

  it("delete removes the file and is a no-op when missing", async () => {
    await deleteCredentials(env);
    await writeCredentials(creds, env);
    await deleteCredentials(env);
    expect(await readCredentials(env)).toBeNull();
  });
});
