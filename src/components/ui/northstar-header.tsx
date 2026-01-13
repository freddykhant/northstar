"use client";

import { Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NorthstarHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-8">
        <Link href="/home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-red-500 to-purple-500">
            <svg
              width="16"
              height="16"
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
          <span className="text-lg font-semibold text-white">Northstar</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/home"
            className={`text-sm transition-colors ${
              pathname === "/home"
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/habits"
            className={`text-sm transition-colors ${
              pathname === "/habits"
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Habits
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/habits"
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-300 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800/70"
        >
          <Settings className="h-4 w-4" />
          Manage Habits
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-400 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-300"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
