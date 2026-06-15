import { Compass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { UnifiedDemo } from "~/_components/landing/unified-demo";
import { auth } from "~/server/auth";

// ─────────────────────────────────────────────────────────────
// Title-page primitives
// ─────────────────────────────────────────────────────────────

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let rem = n;
  for (const [v, s] of map) {
    while (rem >= v) {
      out += s;
      rem -= v;
    }
  }
  return out;
}

function Rule({
  width = 220,
  delay = 0,
}: {
  width?: number;
  delay?: number;
}) {
  return (
    <div
      aria-hidden
      className="animate-fade-in flex items-center justify-center gap-3"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <span
        className="block h-px bg-[var(--color-ink-muted)]/35 dark:bg-[var(--color-ink-dark-muted)]/35"
        style={{ width }}
      />
      <svg
        width="8"
        height="8"
        viewBox="0 0 10 10"
        className="shrink-0 text-[var(--color-ember)]"
      >
        <path
          d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
          fill="currentColor"
        />
      </svg>
      <span
        className="block h-px bg-[var(--color-ink-muted)]/35 dark:bg-[var(--color-ink-dark-muted)]/35"
        style={{ width }}
      />
    </div>
  );
}

function Stagger({
  delay = 0,
  children,
}: {
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

const EPIGRAPH = {
  line: "How we spend our days is, of course, how we spend our lives.",
  by: "Annie Dillard",
};

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  const year = new Date().getFullYear();
  const romanYear = toRoman(year);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-ember)]/20 dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]">
      {/* Subtle paper grain on the title page — pure CSS, no asset */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.025] mix-blend-multiply dark:opacity-[0.04] dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Corner: sign in (fixed, top-right) */}
      <nav className="fixed top-6 right-6 z-50 sm:top-8 sm:right-8">
        <Link
          href="/signin"
          className="text-[11px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase hover:text-[var(--color-ink)] dark:text-[var(--color-ink-dark-muted)] dark:hover:text-[var(--color-ink-dark)]"
        >
          Sign in
        </Link>
      </nav>

      {/* ─────────────────────────────────────────────────────── */}
      {/* The title page                                          */}
      {/* ─────────────────────────────────────────────────────── */}
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-7 px-6 py-20 text-center">
        {/* Compass mark */}
        <Stagger delay={0}>
          <Compass
            size={28}
            weight="duotone"
            className="text-[var(--color-ember)]"
          />
        </Stagger>

        <Rule width={140} delay={100} />

        {/* Wordmark */}
        <Stagger delay={150}>
          <h1
            className="font-serif text-[14px] font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "0.42em",
              textIndent: "0.42em",
            }}
          >
            NORTHSTAR
          </h1>
        </Stagger>

        <Rule width={140} delay={200} />

        {/* Subtitle — stacked like an old title page */}
        <Stagger delay={250}>
          <p
            className="font-serif text-[28px] leading-[1.15] italic text-[var(--color-ink)] sm:text-[32px] dark:text-[var(--color-ink-dark)]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "-0.01em",
              textWrap: "balance",
            }}
          >
            an almanac
            <br />
            for the discipline
            <br />
            of becoming
          </p>
          <p
            className="mt-5 font-serif text-[13px] leading-[1.7] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
            style={{ textWrap: "balance" }}
          >
            being a small record of one&apos;s daily practice
            <br />
            for the mind, the body, &amp; the soul.
          </p>
        </Stagger>

        <Rule width={100} delay={350} />

        {/* Volume + Roman year */}
        <Stagger delay={400}>
          <p className="text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            Vol. I
          </p>
          <p
            className="mt-2 font-serif text-[40px] leading-none font-medium text-[var(--color-ink)] sm:text-[48px] dark:text-[var(--color-ink-dark)]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "0.06em",
            }}
          >
            {romanYear}
          </p>
          <p className="mt-3 tabular text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            {year}
          </p>
        </Stagger>

        <Rule width={100} delay={500} />

        {/* CTA — framed as a printed instruction */}
        <Stagger delay={550}>
          <p className="mb-4 text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            To begin
          </p>
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-3 border border-[var(--color-ember)] bg-[var(--color-ember)] px-7 py-3 text-[12px] tracking-[0.24em] text-[#fbf9f3] uppercase transition-all hover:bg-transparent hover:text-[var(--color-ember)]"
          >
            <span>Start tracking</span>
            <span aria-hidden className="text-[10px]">
              ✦
            </span>
          </Link>
          <p className="mt-4 text-[11px] tracking-[0.04em] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
            or{" "}
            <Link
              href="#inside"
              className="italic underline decoration-[var(--color-ink-muted)]/40 underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-[var(--color-ember)] dark:hover:text-[var(--color-ink-dark)]"
            >
              look inside
            </Link>
          </p>
        </Stagger>

        <Rule width={100} delay={650} />

        {/* Epigraph — same one /home rotates through */}
        <Stagger delay={700}>
          <figure>
            <blockquote
              className="font-serif text-[14px] leading-[1.55] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
              style={{ fontOpticalSizing: "auto", textWrap: "balance" }}
            >
              &ldquo;{EPIGRAPH.line}&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
              — {EPIGRAPH.by}
            </figcaption>
          </figure>
        </Stagger>

        <Rule width={100} delay={800} />

        {/* Contents — Mind / Body / Soul as a TOC */}
        <Stagger delay={850}>
          <p className="mb-4 text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            Contents
          </p>
          <ol className="space-y-2 text-left">
            {(
              [
                ["i", "On the Mind", "—mental & intellectual practice"],
                ["ii", "On the Body", "—physical health & care"],
                ["iii", "On the Soul", "—emotional & spiritual life"],
              ] as const
            ).map(([num, title, sub]) => (
              <li
                key={num}
                className="flex items-baseline gap-4 font-serif text-[13px] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
                style={{ fontOpticalSizing: "auto" }}
              >
                <span className="tabular w-6 shrink-0 text-right text-[var(--color-ember)] italic">
                  {num}.
                </span>
                <span className="italic">{title}</span>
                <span className="text-[11px] text-[var(--color-ink-muted)] not-italic dark:text-[var(--color-ink-dark-muted)]">
                  {sub}
                </span>
              </li>
            ))}
          </ol>
        </Stagger>

        <Rule width={60} delay={950} />

        {/* Closing ornament */}
        <Stagger delay={1000}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 10 10"
            className="text-[var(--color-ember)]"
          >
            <path
              d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
              fill="currentColor"
            />
          </svg>
        </Stagger>
      </main>

      {/* ─────────────────────────────────────────────────────── */}
      {/* A look inside                                           */}
      {/* ─────────────────────────────────────────────────────── */}
      <section
        id="inside"
        className="border-t border-black/8 px-6 py-24 sm:py-32 dark:border-white/8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 flex items-baseline justify-between">
            <p className="text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
              A look inside
            </p>
            <p className="tabular text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
              p. 002
            </p>
          </div>

          <h2
            className="mb-3 max-w-2xl font-serif text-[36px] leading-[1.1] font-medium italic text-[var(--color-ink)] sm:text-[44px] dark:text-[var(--color-ink-dark)]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            <span className="text-[var(--color-ember)] not-italic">§</span> A
            quiet place to keep your daily practice.
          </h2>
          <p className="mb-12 max-w-xl text-[14px] leading-[1.6] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
            One page, three categories, no streak shame. Northstar is shaped
            like a paper journal &mdash; quiet enough to actually use.
          </p>

          <div className="rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-6 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
            <UnifiedDemo />
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Rule width={60} />
            <Link
              href="/signup"
              className="group inline-flex items-baseline gap-2 font-serif text-[16px] italic text-[var(--color-ink)] hover:text-[var(--color-ember)] dark:text-[var(--color-ink-dark)]"
              style={{ fontOpticalSizing: "auto" }}
            >
              Begin your own volume
              <span
                aria-hidden
                className="text-[12px] transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
