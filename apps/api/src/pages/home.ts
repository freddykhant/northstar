import { layout } from "./layout.ts";

export function homePage(): string {
  return layout(
    "Squii",
    `<h1>Squii</h1>
<p>Squii is a habit tracker for your terminal, with a graph of your year across mind, body and soul.</p>
<p><code>npm i -g squii</code></p>
<p>Then say hello: <code>squii hello</code></p>
<p class="note"><a href="/privacy">Privacy</a></p>`,
  );
}
