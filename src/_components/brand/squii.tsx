import { SQUII, tierForSize, type SquiiExpression } from "~/lib/squii";

const MANTLE_FULL =
  "M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44 " +
  "Q20 52.5 23 44 Q26 52.5 29 44 Q32 52.5 35 44 Q38 52.5 41 44 Q44 52.5 47 44 " +
  "C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z";

const MANTLE_SMALL =
  "M32 4 C25 4 19 14 17 26 C15.5 34 16 40 17 44 L47 44 " +
  "C48 40 48.5 34 47 26 C45 14 39 4 32 4 Z";

interface SquiiProps {
  /** px; square. Drives the detail tier — never pass a tier directly. */
  size?: number;
  expression?: SquiiExpression;
  /** When present the mark is announced; otherwise it is decorative. */
  title?: string;
}

export function Squii({ size = 28, expression = "resting", title }: SquiiProps) {
  const tier = tierForSize(size);
  const body = expression === "gold" ? SQUII.gold : SQUII.body;
  const closed = expression === "shy";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className="shrink-0"
    >
      {/* Fins first, behind the mantle. This flare is what reads as a squid
          rather than a ghost — do not reorder or remove it at any tier. */}
      <ellipse cx="14.5" cy="27" rx="8.5" ry="5.2" fill={body} transform="rotate(-27 14.5 27)" />
      <ellipse cx="49.5" cy="27" rx="8.5" ry="5.2" fill={body} transform="rotate(27 49.5 27)" />
      <path d={tier === "small" ? MANTLE_SMALL : MANTLE_FULL} fill={body} />

      {closed ? (
        <>
          <path d="M19 30 q5.5 -4 11 0" fill="none" stroke={SQUII.ink} strokeWidth="2" strokeLinecap="round" />
          <path d="M34 30 q5.5 -4 11 0" fill="none" stroke={SQUII.ink} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="24.5" cy="32" rx="4.4" ry="5.4" fill={SQUII.ink} />
          <ellipse cx="39.5" cy="32" rx="4.4" ry="5.4" fill={SQUII.ink} />
        </>
      )}

      {tier === "full" && (
        <path d="M29.4 38.4 q2.6 3.2 5.2 0" fill="none" stroke={SQUII.ink} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}
