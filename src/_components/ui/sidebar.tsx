"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "./user-button";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  onCreateHabit?: () => void;
}

export function Sidebar({ user, onCreateHabit }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", label: "Home" },
    { href: "/habits", label: "Habits" },
  ];

  return (
    <aside className="fixed top-6 left-0 z-40 flex h-[calc(100vh-3rem)] w-64 flex-col overflow-hidden rounded-r-2xl border-t border-r border-b border-zinc-200/60 bg-white/70 shadow-2xl shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-zinc-200/60 px-6 py-5 dark:border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 via-red-500 to-purple-500 shadow-lg">
          <svg
            width="20"
            height="20"
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
        <div>
          <h1 className="text-lg font-bold text-black dark:text-white">
            Northstar
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-linear-to-r from-blue-500/10 via-red-500/10 to-purple-500/10 text-black shadow-sm dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-linear-to-r from-blue-500 via-red-500 to-purple-500"
                    : "bg-zinc-400 dark:bg-zinc-600"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-3 border-t border-zinc-200/60 p-4 dark:border-white/10">
        {/* Create Habit Button */}
        {onCreateHabit && (
          <button
            onClick={onCreateHabit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 via-red-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Create Habit
          </button>
        )}

        {/* User Button */}
        {user && <UserButton user={user} position="sidebar" />}
      </div>
    </aside>
  );
}
