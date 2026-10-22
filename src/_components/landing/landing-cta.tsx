import Link from "next/link";
import { Squii } from "~/_components/brand/squii";

export function LandingCta() {
  return (
    <section className="reveal border-t border-[var(--color-hairline)] px-6 py-28 text-center">
      {/* Gold Squii is decorative here on purpose: it reads as the PROMISE of a
          perfect day, not a claim that one was earned. The earned instance
          lives in the app. Decorative (no `title`) so it adds nothing to the
          heading that follows. */}
      <span className="inline-block">
        <Squii size={40} expression="gold" />
      </span>
      <h2 className="font-display mx-auto mt-6 max-w-2xl text-[clamp(30px,4.5vw,48px)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
        Start with today.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
        Some days you&rsquo;ll only get one square. That still counts.
      </p>
      <Link
        href="/signup"
        className="mt-8 inline-block rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-canvas)] hover:opacity-90"
      >
        Start tracking
      </Link>
    </section>
  );
}
