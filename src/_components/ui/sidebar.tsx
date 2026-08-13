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
      <div className="flex items-baseline gap-2 border-b border-[var(--color-hairline)] px-6 py-6">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-mind)]"
        />
        <span className="text-[20px] font-extrabold tracking-[-0.02em] text-[var(--color-ink)]">
          northstar
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-[13px] font-semibold ${
                isActive
                  ? "bg-[var(--color-sunken)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-sunken)] hover:text-[var(--color-ink)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[var(--color-hairline)] p-4">
        {user && <UserButton user={user} position="sidebar" />}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-2 md:hidden"
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
        className={`fixed top-0 left-0 z-40 flex h-screen w-60 flex-col overflow-hidden border-r border-[var(--color-hairline)] bg-[var(--color-canvas)] transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
