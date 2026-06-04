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
    <header className="relative z-50 flex items-center justify-between border-b border-black/8 px-6 py-4 dark:border-white/8">
      <div className="flex items-center gap-10">
        <Link href="/home" className="group flex items-baseline gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-ember)]"
          />
          <span
            className="font-serif text-[19px] italic tracking-tight text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
            style={{ fontOpticalSizing: "auto" }}
          >
            northstar
          </span>
        </Link>

        <nav className="flex items-center gap-7">
          {[
            { href: "/home", label: "Home" },
            { href: "/habits", label: "Habits" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] ${
                  isActive
                    ? "text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] dark:text-[var(--color-ink-dark-muted)] dark:hover:text-[var(--color-ink-dark)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user && <UserButton user={user} />}
      </div>
    </header>
  );
}
