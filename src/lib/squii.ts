// Squii's brand colours. These are BRAND values: they identify the product.
// They must never be used to encode a category in the mosaic, where colour
// carries meaning — see scripts/check-palette.ts for the enforced separation.
//
// All three values below are the same in light and dark mode: Squii is one
// character, not a per-theme variant, so he is never retuned between themes.

export const SQUII = {
  /** The body. Sampled from public/squid.png (mid-tone; the render is shaded
   *  from #febfcb lit to #fdacba shadowed). dE from body coral: 62.6 against
   *  light (#f2542d), 43.2 against dark (#ff7d5c) — floor is 40, so DARK is
   *  the binding constraint; check the dark figure, not the light one, before
   *  changing this value. A richer rose #f2857f fails both: 37.9 light /
   *  20.0 dark. */
  body: "#fdb6c0",
  /** Eyes, and available as a display ink. The render's eyes sample at #444273,
   *  which measures only 4.06:1 on the ground and so cannot be used as text.
   *  Deepened to #31356b (4.98:1 on ground, 9.24 -> 11.34:1 on white) so ONE
   *  token serves both the eyes and any text use. Visually near-identical at
   *  eye size. */
  ink: "#31356b",
  /** His lavender ground, sampled from public/squid.png.
   *  MUST match the PNG exactly: the file is RGB with NO alpha channel, so the
   *  lavender is baked in. Any mismatch renders the hero as a visible square. */
  ground: "#be9fe0",
  /** Perfect-day state. Deliberately the existing gold token's light value, so
   *  a gold Squii and a gold tile are the same colour rather than two golds. */
  gold: "#d4a017",
} as const;

export type SquiiExpression = "resting" | "shy" | "gold" | "wave";

/** Detail level. Below 20px the arms merge into a muddy fringe while the fin
 *  flare and eyes stay legible — verified in a browser at 16px on both light
 *  and lavender grounds. This is a legibility rule, not a tidiness one. */
export type MarkTier = "full" | "small";

export function tierForSize(size: number): MarkTier {
  return size <= 19 ? "small" : "full";
}
