import { MosaicTile } from "~/_components/ui/mosaic";
import { Pill } from "~/_components/ui/primitives";
import {
  buildDemoYear,
  LOPSIDED_MONTH_OFFSET,
  parseDayKey,
} from "~/lib/landing-seed";
import { tileBackground } from "~/lib/mosaic";
import { formatDateAsLocal } from "~/lib/utils";

const TILE = 34;
const GAP = 6;

export function LopsidedMonth({ referenceKey }: { referenceKey: string }) {
  const referenceDate = parseDayKey(referenceKey);
  const all = buildDemoYear(referenceDate, 365);

  const first = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - LOPSIDED_MONTH_OFFSET,
    1,
  );
  const monthName = first.toLocaleDateString("en-US", { month: "long" });
  const daysInMonth = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(first.getFullYear(), first.getMonth(), i + 1);
    const key = formatDateAsLocal(date);
    return {
      key,
      value: all.get(key) ?? { mind: false, body: false, soul: false },
    };
  });

  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
            You can see the month you stopped moving.
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
            {monthName} was a reading month. Barely any coral &mdash; the body
            squares are mostly empty, and you can tell at a glance rather than
            from a number.
          </p>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
            Nothing here scolds you for it. It just shows you, so you can decide
            what next month looks like.
          </p>
          <div className="mt-6 flex gap-2">
            <Pill category="mind" />
            <Pill category="body" />
            <Pill category="soul" />
          </div>
        </div>

        <div
          className="grid grid-cols-7 justify-center justify-items-center"
          style={{ gap: GAP }}
          role="img"
          aria-label={`${monthName}: mind and soul kept on most days, body kept on very few`}
        >
          {cells.map(({ key, value }) => (
            <MosaicTile
              key={key}
              categories={value}
              background={tileBackground(value)}
              size={TILE}
              radius="var(--radius-tile-month)"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
