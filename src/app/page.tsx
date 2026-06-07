import Link from "next/link";
import { redirect } from "next/navigation";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { UnifiedDemo } from "~/_components/landing/unified-demo";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_HEX,
  CATEGORY_IDS,
  CATEGORY_LABELS,
} from "~/lib/constants";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]">
      {/* Top bar: wordmark + sign in */}
      <header className="mx-auto flex max-w-4xl items-baseline justify-between px-6 py-8">
        <div className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-ember)]"
          />
          <span
            className="font-serif text-[20px] italic tracking-tight"
            style={{ fontOpticalSizing: "auto" }}
          >
            northstar
          </span>
        </div>
        <Link
          href="/signin"
          className="text-[13px] tracking-[0.04em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] dark:text-[var(--color-ink-dark-muted)] dark:hover:text-[var(--color-ink-dark)]"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <section className="pt-20 pb-24 sm:pt-28 sm:pb-32">
          <h1
            className="max-w-[680px] font-serif text-[44px] leading-[1.05] font-medium sm:text-[56px]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "-0.02em",
            }}
          >
            A quiet place to keep your{" "}
            <em className="text-[var(--color-ember)]">daily practice</em>.
          </h1>
          <p className="mt-6 max-w-[560px] text-[15px] leading-[1.6] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
            Northstar is a habit and mood tracker shaped like a paper journal.
            One page, three categories, no streak shame.
          </p>

          <div className="mt-10 flex items-center gap-5">
            <Link
              href="/signup"
              className="rounded-[6px] bg-[var(--color-ember)] px-5 py-2.5 text-[13px] font-medium tracking-[0.02em] text-[#fbf9f3] hover:opacity-90"
            >
              Start tracking
            </Link>
            <Link
              href="#demo"
              className="text-[13px] tracking-[0.04em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] dark:text-[var(--color-ink-dark-muted)] dark:hover:text-[var(--color-ink-dark)]"
            >
              See it in action →
            </Link>
          </div>
        </section>

        {/* Three-up: Mind / Body / Soul */}
        <section className="border-t border-black/8 py-16 dark:border-white/8">
          <p className="mb-8 text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            Three categories
          </p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {CATEGORY_IDS.map((id) => (
              <div key={id}>
                <div className="mb-3 flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_HEX[id] }}
                  />
                  <h3
                    className="font-serif text-[18px] font-medium"
                    style={{ fontOpticalSizing: "auto" }}
                  >
                    {CATEGORY_LABELS[id]}
                  </h3>
                </div>
                <p className="text-[13px] leading-[1.55] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                  {CATEGORY_DESCRIPTIONS[id]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Demo */}
        <section
          id="demo"
          className="border-t border-black/8 py-16 dark:border-white/8"
        >
          <p className="mb-8 text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            A look inside
          </p>
          <div className="rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-6 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
            <UnifiedDemo />
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
