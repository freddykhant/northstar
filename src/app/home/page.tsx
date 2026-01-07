"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protect the route - redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-zinc-400">Loading...</div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="mb-4 text-4xl font-semibold">
          Welcome, {session.user.name ?? session.user.email}! 🎉
        </h1>
        <p className="text-zinc-400">
          You&apos;re successfully logged in to Northstar.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl bg-white py-3.5 font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
