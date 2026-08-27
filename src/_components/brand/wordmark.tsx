import { SQUII } from "~/lib/squii";

interface WordmarkProps {
  /** Rendered height in px. The lockup scales from this. */
  height?: number;
}

/**
 * The `squii` lockup: monoline geometric letterforms, with the two dots of the
 * `ii` drawn as Squii's eyes in his navy — so the wordmark contains the mascot
 * without drawing him.
 *
 * Drawn rather than set in a webfont, deliberately. The previous brand set
 * `northstar` in Plus Jakarta Sans and overlaid a block on the `t` ascender; the
 * final review called that "the most fragile element of the brand" — a hardcoded
 * em offset tuned to one font's metrics, landing on the wrong glyph during the
 * font-swap window. Drawn strokes are font-independent and immune to FOUT. The
 * cost is unselectable text, which a logo does not need given the aria-label.
 */
export function Wordmark({ height = 30 }: WordmarkProps) {
  return (
    <svg viewBox="0 0 100 44" height={height} role="img" aria-label="squii" className="shrink-0">
      <g
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 15 C23 11 18.5 9.5 14 9.5 C9.5 9.5 5.5 11.5 5.5 15.5 C5.5 19.5 10 20.5 14.5 21.5 C19 22.5 23.5 23.5 23.5 27.5 C23.5 31.5 19 33 14.5 33 C10 33 5.5 31.5 5.5 27.5" />
        <circle cx="41" cy="21.5" r="8.5" />
        <path d="M49.5 13 L49.5 39" />
        <path d="M60 13 L60 25 A6.5 6.5 0 0 0 73 25 L73 13" />
        <path d="M73 25 L73 30" />
        <path d="M83 15 L83 30" />
        <path d="M93 15 L93 30" />
      </g>
      {/* The i-dots ARE Squii's eyes: his navy, his oval ratio. This is the
          brand detail — do not recolour them to match the letterforms. */}
      <ellipse cx="83" cy="7.5" rx="3.6" ry="4.4" fill={SQUII.ink} />
      <ellipse cx="93" cy="7.5" rx="3.6" ry="4.4" fill={SQUII.ink} />
    </svg>
  );
}
