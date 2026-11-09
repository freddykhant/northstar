import http from "node:http";
import type { AddressInfo } from "node:net";
import { SquiiError } from "../api/errors.ts";

export type Loopback = {
  port: number;
  redirectUri: string;
  code: Promise<string>;
  close(): Promise<void>;
};

const MISMATCH = "That sign-in link didn't match. Run `squii login` again.";
const TIMEOUT = "Sign-in timed out. Run `squii login` when you're ready.";

function page(res: http.ServerResponse, status: number, text: string): void {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8", connection: "close" });
  res.end(text);
}

export async function startLoopback(opts: {
  state: string;
  timeoutMs: number;
  doneUrl: string;
}): Promise<Loopback> {
  let settled = false;
  let resolveCode!: (code: string) => void;
  let rejectCode!: (err: Error) => void;
  const code = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });
  // Callers may attach their handler late; never surface this as unhandled.
  code.catch(() => {});

  let closing: Promise<void> | undefined;
  let timer: NodeJS.Timeout | undefined;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (req.method !== "GET" || url.pathname !== "/callback") {
      page(res, 404, "Not found.");
      return;
    }
    if (settled) {
      page(res, 200, "This sign-in has already finished. You can close this tab.");
      return;
    }
    const got = url.searchParams.get("code");
    if (url.searchParams.get("state") !== opts.state || !got) {
      page(res, 400, MISMATCH);
      settle(() => rejectCode(new SquiiError(MISMATCH)));
      return;
    }
    res.writeHead(302, { location: opts.doneUrl, connection: "close" });
    res.end();
    settle(() => resolveCode(got));
  });

  function close(): Promise<void> {
    closing ??= new Promise<void>((resolve) => {
      if (timer) clearTimeout(timer);
      server.close(() => resolve());
      server.closeIdleConnections();
    });
    return closing;
  }

  function settle(fn: () => void): void {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    fn();
    // Let the in-flight response flush, then drop any keep-alive sockets.
    setImmediate(() => {
      void close();
      setTimeout(() => server.closeAllConnections(), 250).unref();
    });
  }

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  timer = setTimeout(() => settle(() => rejectCode(new SquiiError(TIMEOUT))), opts.timeoutMs);

  const port = (server.address() as AddressInfo).port;
  return { port, redirectUri: `http://127.0.0.1:${port}/callback`, code, close };
}
