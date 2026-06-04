"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { UserButton } from "./user-button";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/home", label: "Home" },
    { href: "/habits", label: "Habits" },
  ];

  const sidebarContent = (
    <>
      {/* Wordmark */}
      <div className="flex items-baseline gap-2 border-b border-black/8 px-6 py-6 dark:border-white/8">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-ember)]"
        />
        <span
          className="font-serif text-[20px] italic tracking-tight text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
          style={{ fontOpticalSizing: "auto" }}
        >
          northstar
        </span>
      </div>

      {/* Section label */}
      <div className="px-6 pt-6 pb-2">
        <span className="text-[10px] font-medium tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
          Navigate
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] ${
                isActive
                  ? "text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
                  : "text-[var(--color-ink-muted)] hover:bg-black/3 hover:text-[var(--color-ink)] dark:text-[var(--color-ink-dark-muted)] dark:hover:bg-white/4 dark:hover:text-[var(--color-ink-dark)]"
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-[var(--color-ember)]" />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-black/8 p-4 dark:border-white/8">
        {user && <UserButton user={user} position="sidebar" />}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-[6px] border border-black/8 bg-[var(--color-paper-raised)] p-2 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)] md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X size={18} weight="regular" />
        ) : (
          <List size={18} weight="regular" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-60 flex-col overflow-hidden border-r border-black/8 bg-[var(--color-paper)] transition-transform duration-200 dark:border-white/8 dark:bg-[var(--color-paper-dark)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
