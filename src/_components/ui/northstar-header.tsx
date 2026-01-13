"use client";

import Image from "next/image";
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
    <header className="relative z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-8">
        <Link href="/home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            <Image
              src="/northstar-logo.png"
              alt="Northstar"
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg font-semibold text-black dark:text-white">
            Northstar
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/home"
            className={`text-sm transition-colors ${
              pathname === "/home"
                ? "text-black dark:text-white"
                : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/habits"
            className={`text-sm transition-colors ${
              pathname === "/habits"
                ? "text-black dark:text-white"
                : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
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
