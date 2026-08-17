import { CATEGORY_DESCRIPTIONS, CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";

export function Categories() {
  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
          Three parts of a life.
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {CATEGORY_IDS.map((id) => (
            <div
              key={id}
              className="rounded-[22px] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6"
            >
              <span
                aria-hidden
                className="inline-block h-9 w-9 rounded-full"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-${id}) 18%, transparent)`,
                }}
              />
              <h3
                className="mt-4 text-[18px] font-bold"
                style={{ color: `var(--color-${id}-ink)` }}
              >
                {CATEGORY_LABELS[id]}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-ink-muted)]">
                {CATEGORY_DESCRIPTIONS[id]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
