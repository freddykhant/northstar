import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();

  // If already logged in, redirect to home
  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white">
      {/* Enhanced Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.4) 0%, transparent 60%)
          `,
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-10">
          {/* Logo/Icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/20">
            <p className="text-5xl">✨</p>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="mb-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-6xl font-bold text-transparent">
              Northstar
            </h1>
            <p className="text-xl text-zinc-400">
              Track your habits. Build consistency. Reach your goals.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-32 py-4 text-center font-semibold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-zinc-100"
            >
              Get Started
            </Link>
            <Link
              href="/signin"
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-32 py-4 text-center font-semibold text-white backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800/70"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
