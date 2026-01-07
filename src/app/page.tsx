import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  // If already logged in, redirect to home
  if (session?.user) {
    redirect("/home");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-8">
        {/* Logo/Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
          <span className="text-4xl">⭐</span>
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
            className="rounded-xl bg-white px-32 py-4 text-center text-base font-medium text-black transition-all hover:bg-zinc-200"
          >
            Get Started
          </Link>
          <Link
            href="/signin"
            className="rounded-xl bg-zinc-800 px-32 py-4 text-center text-base font-medium text-white transition-all hover:bg-zinc-700"
          >
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
