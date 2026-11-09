import { layout } from "./layout.ts";

export function cliDonePage(): string {
  return layout(
    "You're in",
    `<h1>Squii</h1>
<p>You're in. You can close this tab and head back to your terminal.</p>`,
  );
}
