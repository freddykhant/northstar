import { layout } from "./layout.ts";

export function privacyPage(): string {
  return layout(
    "Squii privacy",
    `<h1>Privacy</h1>
<p>Squii keeps only what it needs to draw your graph:</p>
<ul>
<li>your account name and email</li>
<li>your habits</li>
<li>your ticks</li>
<li>your moods</li>
</ul>
<p>Nothing is shared and nothing is sold. Ever.</p>
<p class="note"><a href="/">Back to Squii</a></p>`,
  );
}
