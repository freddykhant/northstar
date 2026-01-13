import Link from "next/link";
import { redirect } from "next/navigation";
import { FloatingNavbar } from "~/_components/landing/floating-navbar";
import { InteractiveActivityGraph } from "~/_components/landing/interactive-activity-graph";
import { InteractiveHabitDemo } from "~/_components/landing/interactive-habit-demo";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();

  // If already logged in, redirect to home
  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-float absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/30 blur-[120px]"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="animate-float absolute top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-red-500/20 blur-[100px]"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="animate-float absolute bottom-20 left-1/3 h-[450px] w-[450px] rounded-full bg-purple-500/25 blur-[110px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Noise Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Navigation */}
      <FloatingNavbar />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 pt-20">
          <div className="mx-auto max-w-7xl">
            {/* Hero Content */}
            <div className="mb-20 text-center">
              <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm text-zinc-300">
                  Join others building better habits
                </span>
              </div>

              <h1
                className="animate-fade-in-up mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-6xl leading-tight font-bold text-transparent sm:text-7xl lg:text-8xl"
                style={{ animationDelay: "0.1s" }}
              >
                Your daily habits,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-red-400 to-purple-400 bg-clip-text">
                  beautifully visualized
                </span>
              </h1>

              <p
                className="animate-fade-in-up mx-auto mb-10 max-w-2xl text-lg text-zinc-400 sm:text-xl"
                style={{ animationDelay: "0.2s" }}
              >
                Track habits across mind, body, and soul. Watch your consistency
                grow with a GitHub-style activity graph that makes progress
                rewarding.
              </p>

              <div
                className="animate-fade-in-up flex flex-col items-center justify-center gap-4 sm:flex-row"
                style={{ animationDelay: "0.3s" }}
              >
                <Link
                  href="/signup"
                  className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 font-semibold text-black shadow-xl shadow-white/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 via-red-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="#features"
                  className="group rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  See how it works
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Interactive Demo Section */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <InteractiveHabitDemo />
              </div>
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
                <InteractiveActivityGraph />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                Three dimensions.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                  One powerful system.
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                Track your growth across the three pillars of wellbeing
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Mind Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-8 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/20 blur-3xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 text-5xl">🧠</div>
                  <h3 className="mb-2 text-2xl font-bold text-blue-300">
                    Mind
                  </h3>
                  <p className="text-zinc-400">
                    Mental clarity, learning, creativity. Build your
                    intellectual foundation.
                  </p>
                </div>
              </div>

              {/* Body Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5 p-8 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/20">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-500/20 blur-3xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 text-5xl">💪</div>
                  <h3 className="mb-2 text-2xl font-bold text-red-300">Body</h3>
                  <p className="text-zinc-400">
                    Physical health, fitness, energy. Strengthen your vessel.
                  </p>
                </div>
              </div>

              {/* Soul Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-8 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-500/20 blur-3xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 text-5xl">✨</div>
                  <h3 className="mb-2 text-2xl font-bold text-purple-300">
                    Soul
                  </h3>
                  <p className="text-zinc-400">
                    Inner peace, gratitude, purpose. Nurture your spirit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className="px-4 py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                Simple by design
              </h2>
              <p className="text-lg text-zinc-400">
                No complexity. No overwhelm. Just you and your habits.
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                  1
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    Create your habits
                  </h3>
                  <p className="text-zinc-400">
                    Define habits across mind, body, and soul. Keep it simple,
                    keep it meaningful.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-xl font-bold text-white shadow-lg shadow-red-500/30">
                  2
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    Check in daily
                  </h3>
                  <p className="text-zinc-400">
                    Mark habits complete as you do them. Watch your graph light
                    up with each action.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-purple-500/30">
                  3
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    Build your streak
                  </h3>
                  <p className="text-zinc-400">
                    Consistency compounds. See your progress visualized over
                    weeks, months, and years.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-4 py-32">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-red-500/10 to-purple-500/10 p-12 text-center backdrop-blur-sm sm:p-16">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-red-500/5 to-purple-500/5" />
              <div className="relative">
                <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                  Ready to start?
                </h2>
                <p className="mb-8 text-lg text-zinc-300">
                  Your future self will thank you for the habits you build
                  today.
                </p>
                <Link
                  href="/signup"
                  className="inline-block rounded-xl bg-white px-10 py-4 text-lg font-semibold text-black shadow-xl shadow-white/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-red-500 to-purple-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">
                  Northstar
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                © 2026 Northstar. Built for consistency.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
