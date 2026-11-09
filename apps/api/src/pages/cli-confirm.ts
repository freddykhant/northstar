import { escapeHtml, layout } from "./layout.ts";

export type AuthorizeParams = {
  codeChallenge: string;
  state: string;
  redirectUri: string;
};

export function cliConfirmPage(userName: string, p: AuthorizeParams): string {
  const hidden = (name: string, value: string) =>
    `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
  return layout(
    "Sign in to Squii",
    `<h1>Sign in to Squii?</h1>
<p>Sign in to Squii in your terminal as ${escapeHtml(userName)}?</p>
<form method="post" action="/cli/authorize">
${hidden("code_challenge", p.codeChallenge)}
${hidden("code_challenge_method", "S256")}
${hidden("state", p.state)}
${hidden("redirect_uri", p.redirectUri)}
<button type="submit">Continue</button>
</form>
<p class="note">Only continue if you just ran <code>squii login</code>.</p>`,
  );
}

export function cliErrorPage(message: string): string {
  return layout(
    "Squii",
    `<h1>Hmm, that didn't work</h1>
<p>${escapeHtml(message)}</p>`,
  );
}
