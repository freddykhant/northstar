import { MARK_RADIUS_RATIO, markBackground, type MarkState } from "~/lib/brand";

interface BrandMarkProps {
  /** px; the mark is square */
  size?: number;
  state?: MarkState;
}

export function BrandMark({ size = 28, state = "resting" }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * MARK_RADIUS_RATIO,
        background: markBackground(state),
      }}
    />
  );
}
