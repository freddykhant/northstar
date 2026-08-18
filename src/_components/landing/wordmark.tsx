interface WordmarkProps {
  size?: number;
}

/**
 * Lowercase `northstar`, Plus Jakarta Sans at its heaviest, tightly tracked.
 * The `t` ascender is cut flat and shortened to x-height so it reads as a tile
 * edge rather than a stem — done by overlaying a canvas-coloured block on the
 * ascender, which keeps the word selectable and screen-reader-legible.
 *
 * Size is applied as an inline style rather than a Tailwind class: Tailwind v4
 * emits arbitrary-value utilities sorted numerically rather than by source
 * order, so two `text-[Npx]` classes of equal specificity can resolve in an
 * order that ignores which one a caller passed. An inline style always wins
 * regardless of stylesheet order.
 *
 * There is deliberately no `className` prop. Nothing passes one, and the
 * escape hatch would be a trap: the inline `fontSize` above beats any class,
 * so a caller passing `text-[Npx]` would be silently ignored — the exact
 * silent-override bug `size` exists to prevent. Callers needing a different
 * size pass `size`; callers needing layout wrap this in their own element.
 */
export function Wordmark({ size = 19 }: WordmarkProps) {
  return (
    <span
      style={{ fontSize: size }}
      className="relative leading-none font-extrabold tracking-[-0.03em] text-[var(--color-ink)]"
    >
      northstar
      <span
        aria-hidden
        className="absolute top-0 left-[3.62em] h-[0.22em] w-[0.09em] bg-[var(--color-canvas)]"
      />
    </span>
  );
}
