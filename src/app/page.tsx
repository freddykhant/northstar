import { redirect } from "next/navigation";
import { Comparison } from "~/_components/landing/comparison";
import { Hero } from "~/_components/landing/hero";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { LandingNav } from "~/_components/landing/landing-nav";
import { LopsidedMonth } from "~/_components/landing/lopsided-month";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  // Resolved once on the server and passed down, so the mosaic grid has the
  // same shape on both sides of hydration.
  const referenceDate = new Date();

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] selection:bg-[var(--color-mind)]/20">
      <LandingNav />
      <Hero referenceDate={referenceDate} />
      <Comparison referenceDate={referenceDate} />
      <LopsidedMonth referenceDate={referenceDate} />
      <LandingFooter />
    </div>
  );
}
