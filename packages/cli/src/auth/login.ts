import { SquiiError, UpgradeRequiredError } from "../api/errors.ts";
import { writeCredentials } from "../config/credentials.ts";
import type { Credentials } from "../config/credentials.ts";
import { VERSION } from "../version.ts";
import { startLoopback } from "./loopback.ts";
import { createPkcePair, randomToken } from "./pkce.ts";

export async function login(deps: {
  apiUrl: string;
  openBrowser(url: string): Promise<void>;
  print(line: string): void;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
}): Promise<Credentials> {
  const apiUrl = deps.apiUrl.replace(/\/+$/, "");
  const { verifier, challenge } = createPkcePair();
  const state = randomToken(32);
  const loop = await startLoopback({
    state,
    timeoutMs: deps.timeoutMs ?? 300_000,
    doneUrl: `${apiUrl}/cli/done`,
  });
  try {
    const authorizeUrl = `${apiUrl}/cli/authorize?${new URLSearchParams({
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
      redirect_uri: loop.redirectUri,
    })}`;
    deps.print(`If your browser didn't open, visit: ${authorizeUrl}`);
    try {
      await deps.openBrowser(authorizeUrl);
    } catch {
      // the fallback line is already printed
    }
    const code = await loop.code;

    const res = await fetch(`${apiUrl}/cli/token`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-squii-version": VERSION },
      body: JSON.stringify({ code, code_verifier: verifier }),
    });
    if (res.status === 426) {
      let min = "latest";
      try {
        const body = (await res.json()) as { minVersion?: unknown };
        if (typeof body.minVersion === "string") min = body.minVersion;
      } catch {
        // generic label
      }
      throw new UpgradeRequiredError(min);
    }
    const failed = new SquiiError("That sign-in didn't go through. Run `squii login` again.");
    if (res.status !== 200) throw failed;
    const body = (await res.json().catch(() => null)) as {
      token?: unknown;
      user?: { name?: unknown; email?: unknown };
    } | null;
    if (
      !body ||
      typeof body.token !== "string" ||
      typeof body.user?.name !== "string" ||
      typeof body.user.email !== "string"
    ) {
      throw failed;
    }
    const creds: Credentials = {
      apiUrl,
      token: body.token,
      user: { name: body.user.name, email: body.user.email },
      createdAt: new Date().toISOString(),
    };
    await writeCredentials(creds, deps.env);
    deps.print(`Signed in as ${creds.user.name}. Welcome to Squii!`);
    return creds;
  } finally {
    await loop.close();
  }
}
