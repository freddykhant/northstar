import { InteractiveYear } from "./interactive-year";

interface HeroProps {
  referenceDate: Date;
}

export function Hero({ referenceDate }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-wash-from)] to-[var(--color-wash-to)] px-6 pt-10 pb-28">
      {/* Grain. Pure CSS, no asset — carried over from the previous design. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1
          className="animate-rise-in font-display text-[clamp(40px,6vw,64px)] leading-[1.05] font-normal tracking-[-0.02em] text-[var(--color-ink)]"
          style={{ textWrap: "balance" }}
        >
          Your year, in three colours.
        </h1>
        <p
          className="animate-rise-in mx-auto mt-5 max-w-xl text-[16px] leading-[1.6] text-[var(--color-ink-muted)]"
          style={{
            animationDelay: "120ms",
            animationFillMode: "both",
            textWrap: "balance",
          }}
        >
          Mind, body, soul &mdash; one square a day. See which part of your life
          you&rsquo;re actually showing up for.
        </p>
      </div>

      <div
        className="animate-rise-in relative mx-auto mt-14 max-w-4xl"
        style={{ animationDelay: "240ms", animationFillMode: "both" }}
      >
        <div className="rounded-[28px] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lift)] sm:p-8">
          <InteractiveYear referenceDate={referenceDate} />
        </div>
      </div>
    </section>
  );
}
