import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  // If already logged in, redirect to home
  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white">
      {/* Base dark gradient layer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(38, 35, 32, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 45%, rgba(45, 40, 35, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.5) 0%, transparent 60%)
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
        <div className="flex flex-col items-center gap-8">
          {/* Logo/Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            <p className="text-4xl">✨</p>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="mb-3 text-5xl font-semibold">Northstar</h1>
            <p className="text-lg text-zinc-400">
              Track your habits. Reach your goals.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-32 py-3 text-center font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Get Started
            </Link>
            <Link
              href="/signin"
              className="rounded-xl bg-zinc-800 px-32 py-3 text-center font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
