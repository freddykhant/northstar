import { jsString, layout } from "./layout.ts";

/**
 * Only same-site absolute paths survive. Browsers treat `/\evil.example` like
 * `//evil.example`, so backslashes and control characters are rejected too.
 */
export function safeNext(next: string | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.includes("\\")) return "/";
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control characters is the point
  if (/[\u0000-\u001f\u007f]/.test(next)) return "/";
  return next;
}

export function signinPage(next: string | undefined): string {
  const callbackURL = safeNext(next);
  return layout(
    "Sign in to Squii",
    `<h1>Sign in to Squii</h1>
<p>Pick one and Squii will take it from there.</p>
<button type="button" data-provider="google">Continue with Google</button>
<button type="button" data-provider="github">Continue with GitHub</button>
<p class="note" id="msg" role="status"></p>
<script>
const callbackURL = ${jsString(callbackURL)};
document.querySelectorAll("button[data-provider]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const msg = document.getElementById("msg");
    try {
      const res = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: btn.dataset.provider, callbackURL }),
      });
      const data = await res.json();
      if (!data.url) throw new Error("no url");
      window.location.href = data.url;
    } catch {
      msg.textContent = "Squii couldn't start that. Give it another go?";
    }
  });
});
</script>`,
  );
}
