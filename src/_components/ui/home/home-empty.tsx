import Link from "next/link";
import { CATEGORY_IDS, CATEGORY_DESCRIPTIONS } from "~/lib/constants";
import { Card, Pill } from "../primitives";

export function HomeEmpty() {
  return (
    <Card>
      <h2 className="text-title text-[var(--color-ink)]">Start with one habit</h2>
      <p className="mt-2 text-[14px] text-[var(--color-ink-muted)]">
        Northstar tracks three parts of your life. Every day you show up for one
        of them, that day lights up in your mosaic.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {CATEGORY_IDS.map((id) => (
          <div key={id} className="flex items-center gap-3">
            <Pill category={id} />
            <span className="text-[13px] text-[var(--color-ink-muted)]">
              {CATEGORY_DESCRIPTIONS[id]}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/habits"
        className="mt-5 inline-block rounded-[var(--radius-control)] bg-[var(--color-mind)] px-5 py-2.5 text-[13px] font-bold text-white"
      >
        Create your first habit
      </Link>
    </Card>
  );
}
