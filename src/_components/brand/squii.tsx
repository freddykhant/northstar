import {
  EYE_LEFT,
  EYE_RIGHT,
  FIN_LEFT,
  FIN_RIGHT,
  MANTLE_FULL,
  MANTLE_SMALL,
  SQUII,
  tierForSize,
  type SquiiExpression,
} from "~/lib/squii";

interface SquiiProps {
  /** px; square. Drives the detail tier — never pass a tier directly. */
  size?: number;
  expression?: SquiiExpression;
  /** When present the mark is announced; otherwise it is decorative. */
  title?: string;
}

export function Squii({
  size = 28,
  expression = "resting",
  title,
}: SquiiProps) {
  const tier = tierForSize(size);
  const body = expression === "gold" ? SQUII.gold : SQUII.body;
  const closed = expression === "shy";
  // Empty string is treated the same as "no title" so the role/label/hidden
  // trio stays symmetrical: a caller passing title="" gets a fully
  // decorative mark, not aria-hidden plus a stray empty aria-label.
  const announced = title === "" ? undefined : title;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={announced ? "img" : undefined}
      aria-label={announced}
      aria-hidden={announced ? undefined : true}
      className="shrink-0"
    >
      {/* Fins first, behind the mantle. This flare is what reads as a squid
          rather than a ghost — do not reorder or remove it at any tier. */}
      <ellipse
        cx={FIN_LEFT.cx}
        cy={FIN_LEFT.cy}
        rx={FIN_LEFT.rx}
        ry={FIN_LEFT.ry}
        fill={body}
        transform={`rotate(${FIN_LEFT.rotation} ${FIN_LEFT.cx} ${FIN_LEFT.cy})`}
      />
      <ellipse
        cx={FIN_RIGHT.cx}
        cy={FIN_RIGHT.cy}
        rx={FIN_RIGHT.rx}
        ry={FIN_RIGHT.ry}
        fill={body}
        transform={`rotate(${FIN_RIGHT.rotation} ${FIN_RIGHT.cx} ${FIN_RIGHT.cy})`}
      />
      <path d={tier === "small" ? MANTLE_SMALL : MANTLE_FULL} fill={body} />

      {closed ? (
        <>
          <path
            d="M19 30 q5.5 -4 11 0"
            fill="none"
            stroke={SQUII.ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M34 30 q5.5 -4 11 0"
            fill="none"
            stroke={SQUII.ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse
            cx={EYE_LEFT.cx}
            cy={EYE_LEFT.cy}
            rx={EYE_LEFT.rx}
            ry={EYE_LEFT.ry}
            fill={SQUII.ink}
          />
          <ellipse
            cx={EYE_RIGHT.cx}
            cy={EYE_RIGHT.cy}
            rx={EYE_RIGHT.rx}
            ry={EYE_RIGHT.ry}
            fill={SQUII.ink}
          />
        </>
      )}

      {tier === "full" && (
        <path
          d="M29.4 38.4 q2.6 3.2 5.2 0"
          fill="none"
          stroke={SQUII.ink}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
