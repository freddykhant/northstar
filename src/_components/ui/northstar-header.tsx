"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "./user-button";

interface NorthstarHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function NorthstarHeader({ user }: NorthstarHeaderProps) {
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
        {user && <UserButton user={user} />}
      </div>
    </header>
  );
}
