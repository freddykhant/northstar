"use client";

import { CaretDown, Moon, SignOut, Sun } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface UserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  position?: "left" | "right" | "sidebar";
}

export function UserButton({ user, position = "right" }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Resolve the display name once: covers null/undefined, an empty string,
  // and a whitespace-only string, so every site that shows the user's name
  // (avatar initials, alt text, sidebar label, dropdown header) falls back
  // consistently instead of rendering blank. `??` would not catch `""` or
  // `" "`, so `||` on the trimmed value is required here, not just idiomatic.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const displayName = user.name?.trim() || "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isSidebar = position === "sidebar";

  const Avatar = ({ size }: { size: number }) => (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)] text-[11px] font-medium text-[var(--color-ink)]"
      style={{ width: size, height: size }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={displayName}
          width={size}
          height={size}
          className="rounded-full"
        />
      ) : (
        initials
      )}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isSidebar
            ? "flex w-full items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 hover:bg-[var(--color-sunken)]"
            : "flex items-center"
        }
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {isSidebar ? (
          <>
            <Avatar size={28} />
            <span className="min-w-0 flex-1 truncate text-left text-[13px] text-[var(--color-ink)]">
              {displayName}
            </span>
            <CaretDown
              size={12}
              weight="regular"
              className="text-[var(--color-ink-muted)]"
            />
          </>
        ) : (
          <Avatar size={28} />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-90"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div
            className={`absolute z-100 w-60 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-lift)] ${
              position === "sidebar"
                ? "bottom-full left-0 mb-2"
                : position === "right"
                  ? "top-full right-0 mt-2"
                  : "top-full left-[calc(100%+0.5rem)] mt-2"
            }`}
          >
            <div className="border-b border-[var(--color-hairline)] px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar size={32} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-[13px] text-[var(--color-ink)]">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-[var(--color-ink-muted)]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-1">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex w-full items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-sunken)]"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={14} weight="regular" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <Moon size={14} weight="regular" />
                      Dark mode
                    </>
                  )}
                </button>
              )}

              <div className="my-1 border-t border-[var(--color-hairline)]" />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-sunken)]"
              >
                <SignOut size={14} weight="regular" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
