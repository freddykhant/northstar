import { redirect } from "next/navigation";
import { Categories } from "~/_components/landing/categories";
import { Comparison } from "~/_components/landing/comparison";
import { Hero } from "~/_components/landing/hero";
import { LandingCta } from "~/_components/landing/landing-cta";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { LandingNav } from "~/_components/landing/landing-nav";
import { LopsidedMonth } from "~/_components/landing/lopsided-month";
import { RevealOnScroll } from "~/_components/landing/reveal-on-scroll";
import { auth } from "~/server/auth";
import { formatDateAsLocal } from "~/lib/utils";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  // Resolved once on the server and passed down as a `YYYY-MM-DD` key, never
  // as a Date. A Date crosses the RSC boundary as an instant, and the client
  // would re-read it in the VISITOR's zone — shifting every tile by a day and
  // blowing up hydration whenever the two zones disagree.
  const referenceKey = formatDateAsLocal(new Date());

  return (
    <div className="min-h-dvh bg-[var(--color-canvas)] text-[var(--color-ink)] selection:bg-[var(--color-mind)]/20">
      {/* skip-links: first tab stop, visible only while focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-[var(--color-canvas)]"
      >
        Skip to content
      </a>
      <LandingNav />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero referenceKey={referenceKey} />
        <Comparison referenceKey={referenceKey} />
        <LopsidedMonth referenceKey={referenceKey} />
        <Categories />
        <LandingCta />
      </main>
      <LandingFooter />
      <RevealOnScroll />
    </div>
  );
}
