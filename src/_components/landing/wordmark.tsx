interface WordmarkProps {
  className?: string;
}

/**
 * Lowercase `northstar`, Plus Jakarta Sans at its heaviest, tightly tracked.
 * The `t` ascender is cut flat and shortened to x-height so it reads as a tile
 * edge rather than a stem — done by overlaying a canvas-coloured block on the
 * ascender, which keeps the word selectable and screen-reader-legible.
 */
const BASE_CLASSNAME =
  "relative text-[19px] leading-none font-extrabold tracking-[-0.03em] text-[var(--color-ink)]";

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={
        className ? `${BASE_CLASSNAME} ${className}` : BASE_CLASSNAME
      }
    >
      northstar
      <span
        aria-hidden
        className="absolute top-0 left-[3.62em] h-[0.22em] w-[0.09em] bg-[var(--color-canvas)]"
      />
    </span>
  );
}
