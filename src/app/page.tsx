import Link from "next/link";
import { redirect } from "next/navigation";
import { CategoryCarousel } from "~/_components/landing/category-carousel";
import { FloatingNavbar } from "~/_components/landing/floating-navbar";
import { LandingFooter } from "~/_components/landing/landing-footer";
import { ScrollingBadge } from "~/_components/landing/scrolling-badge";
import { UnifiedDemo } from "~/_components/landing/unified-demo";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();

  // If already logged in, redirect to home
  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Subtle Background Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-400/20" />
        <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[100px] dark:bg-purple-400/20" />
      </div>

      {/* Floating Navigation */}
      <FloatingNavbar />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 pt-32 pb-32">
          <div className="mx-auto max-w-7xl">
            {/* Headline */}
            <div className="mb-16 text-center">
              <h1 className="animate-fade-in-up mb-8 text-6xl leading-[1.05] font-bold text-black sm:text-7xl lg:text-[5.5rem] dark:text-white">
                Build habits to reach
                <br />
                your{" "}
                <span className="relative inline-block">
                  Northstar
                  <span className="absolute -top-2 -right-2 text-5xl">✨</span>
                </span>
                .
              </h1>

              {/* CTA Buttons - ReadMe Style */}
              <div
                className="animate-fade-in-up mb-12 flex flex-wrap items-center justify-center gap-3"
                style={{ animationDelay: "0.1s" }}
              >
                <Link
                  href="/signup"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Get Started
                </Link>
                <span className="text-zinc-600 dark:text-zinc-400">or</span>
                <Link
                  href="#demo"
                  className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  See it in action
                </Link>
              </div>

              {/* Feature Badges - Click to scroll */}
              <div
                className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3"
                style={{ animationDelay: "0.2s" }}
              >
                <ScrollingBadge
                  icon="mind"
                  label="Mind"
                  targetId="mind"
                  color="blue"
                />
                <ScrollingBadge
                  icon="body"
                  label="Body"
                  targetId="body"
                  color="red"
                />
                <ScrollingBadge
                  icon="soul"
                  label="Soul"
                  targetId="soul"
                  color="purple"
                />
              </div>
            </div>

            {/* Interactive Unified Demo */}
            <div
              id="demo"
              className="animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <UnifiedDemo />
            </div>
          </div>
        </section>

        {/* Category Carousel */}
        <CategoryCarousel />

        {/* Footer */}
        <LandingFooter />
      </main>
    </div>
  );
}
