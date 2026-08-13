import { Compass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { UnifiedDemo } from "~/_components/landing/unified-demo";
import { Card } from "~/_components/ui/primitives";
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
      className="animate-rise-in flex items-center justify-center gap-3"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <span
        className="block h-px bg-[var(--color-ink-muted)]/35"
        style={{ width }}
      />
      <svg
        width="8"
        height="8"
        viewBox="0 0 10 10"
        className="shrink-0 text-[var(--color-mind)]"
      >
        <path
          d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
          fill="currentColor"
        />
      </svg>
      <span
        className="block h-px bg-[var(--color-ink-muted)]/35"
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
      className="animate-rise-in"
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
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] selection:bg-[var(--color-mind)]/20">
      {/* Subtle grain on the title page — pure CSS, no asset */}
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
          className="text-[11px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase hover:text-[var(--color-ink)]"
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
            className="text-[var(--color-mind)]"
          />
        </Stagger>

        <Rule width={140} delay={100} />

        {/* Wordmark */}
        <Stagger delay={150}>
          <h1
            className="text-[14px] font-medium text-[var(--color-ink)]"
            style={{
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
            className="text-[28px] leading-[1.15] font-medium text-[var(--color-ink)] sm:text-[32px]"
            style={{
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
            className="mt-5 text-[13px] leading-[1.7] text-[var(--color-ink-muted)]"
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
          <p className="text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase">
            Vol. I
          </p>
          <p
            className="mt-2 text-[40px] leading-none font-medium text-[var(--color-ink)] sm:text-[48px]"
            style={{
              letterSpacing: "0.06em",
            }}
          >
            {romanYear}
          </p>
          <p className="tabular mt-3 text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase">
            {year}
          </p>
        </Stagger>

        <Rule width={100} delay={500} />

        {/* CTA — framed as a printed instruction */}
        <Stagger delay={550}>
          <p className="mb-4 text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase">
            To begin
          </p>
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-3 border border-[var(--color-mind)] bg-[var(--color-mind)] px-7 py-3 text-[12px] tracking-[0.24em] text-[var(--color-surface)] uppercase transition-all hover:bg-transparent hover:text-[var(--color-mind)]"
          >
            <span>Start tracking</span>
            <span aria-hidden className="text-[10px]">
              ✦
            </span>
          </Link>
          <p className="mt-4 text-[11px] tracking-[0.04em] text-[var(--color-ink-muted)]">
            or{" "}
            <Link
              href="#inside"
              className="underline decoration-[var(--color-ink-muted)]/40 underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-[var(--color-mind)]"
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
              className="text-[14px] leading-[1.55] text-[var(--color-ink-muted)]"
              style={{ textWrap: "balance" }}
            >
              &ldquo;{EPIGRAPH.line}&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase">
              — {EPIGRAPH.by}
            </figcaption>
          </figure>
        </Stagger>

        <Rule width={100} delay={800} />

        {/* Contents — Mind / Body / Soul as a TOC */}
        <Stagger delay={850}>
          <p className="mb-4 text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase">
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
                className="flex items-baseline gap-4 text-[13px] text-[var(--color-ink)]"
              >
                <span className="tabular w-6 shrink-0 text-right text-[var(--color-mind)]">
                  {num}.
                </span>
                <span>{title}</span>
                <span className="text-[11px] text-[var(--color-ink-muted)]">
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
            className="text-[var(--color-mind)]"
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
        className="border-t border-[var(--color-hairline)] px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 flex items-baseline justify-between">
            <p className="text-[10px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase">
              A look inside
            </p>
            <p className="tabular text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase">
              p. 002
            </p>
          </div>

          <h2
            className="mb-3 max-w-2xl text-[36px] leading-[1.1] font-medium text-[var(--color-ink)] sm:text-[44px]"
            style={{
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            <span className="text-[var(--color-mind)]">§</span> A quiet place
            to keep your daily practice.
          </h2>
          <p className="mb-12 max-w-xl text-[14px] leading-[1.6] text-[var(--color-ink-muted)]">
            One page, three categories, no streak shame. Northstar is shaped
            like a paper journal &mdash; quiet enough to actually use.
          </p>

          <Card className="p-6">
            <UnifiedDemo />
          </Card>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Rule width={60} />
            <Link
              href="/signup"
              className="group inline-flex items-baseline gap-2 text-[16px] font-medium text-[var(--color-ink)] hover:text-[var(--color-mind)]"
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
