import net from "node:net";
import { describe, expect, it } from "vitest";
import { SquiiError } from "../src/api/errors.ts";
import { startLoopback } from "../src/auth/loopback.ts";

const DONE = "https://squii.test/cli/done";

describe("startLoopback", () => {
  it("resolves the code on a matching state and redirects to doneUrl", async () => {
    const lb = await startLoopback({ state: "s1", timeoutMs: 5000, doneUrl: DONE });
    expect(lb.redirectUri).toBe(`http://127.0.0.1:${lb.port}/callback`);
    const res = await fetch(`${lb.redirectUri}?code=abc&state=s1`, { redirect: "manual" });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(DONE);
    await expect(lb.code).resolves.toBe("abc");
    await lb.close();
  });

  it("rejects on a state mismatch", async () => {
    const lb = await startLoopback({ state: "s1", timeoutMs: 5000, doneUrl: DONE });
    const assertion = expect(lb.code).rejects.toThrow(
      new SquiiError("That sign-in link didn't match. Run `squii login` again."),
    );
    const res = await fetch(`${lb.redirectUri}?code=abc&state=nope`, { redirect: "manual" });
    expect(res.status).toBe(400);
    await assertion;
    await lb.close();
  });

  it("treats a callback without a code as a mismatch and 404s other paths", async () => {
    const lb = await startLoopback({ state: "s1", timeoutMs: 5000, doneUrl: DONE });
    const other = await fetch(`http://127.0.0.1:${lb.port}/nope`);
    expect(other.status).toBe(404);
    const assertion = expect(lb.code).rejects.toBeInstanceOf(SquiiError);
    const res = await fetch(`${lb.redirectUri}?state=s1`, { redirect: "manual" });
    expect(res.status).toBe(400);
    await assertion;
    await lb.close();
  });

  it("times out and frees the port", async () => {
    const lb = await startLoopback({ state: "s1", timeoutMs: 50, doneUrl: DONE });
    await expect(lb.code).rejects.toThrow(
      new SquiiError("Sign-in timed out. Run `squii login` when you're ready."),
    );
    await new Promise<void>((resolve, reject) => {
      const s = net.connect(lb.port, "127.0.0.1");
      s.once("connect", () => (s.destroy(), reject(new Error("still listening"))));
      s.once("error", () => resolve());
    });
    await lb.close();
    await lb.close();
  });
});
