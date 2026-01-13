"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 transition-all duration-500 ${
        isScrolled ? "scale-[0.98]" : "scale-100"
      }`}
    >
      <div
        className={`flex items-center gap-6 rounded-2xl border px-6 py-3.5 backdrop-blur-2xl transition-all duration-500 ${
          isScrolled
            ? "border-zinc-200/80 bg-white/90 shadow-xl shadow-black/5"
            : "border-zinc-200/50 bg-white/70 shadow-lg shadow-black/5"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 via-red-500 to-purple-500 shadow-lg">
            <svg
              width="14"
              height="14"
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
          <span className="text-sm font-bold text-black">Northstar</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-zinc-200" />

        {/* Nav Links */}
        <div className="hidden items-center gap-5 sm:flex">
          <a
            href="#features"
            className="text-sm text-zinc-600 transition-colors hover:text-black"
          >
            Features
          </a>
          <a
            href="#demo"
            className="text-sm text-zinc-600 transition-colors hover:text-black"
          >
            Demo
          </a>
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-zinc-200 sm:block" />

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="text-sm text-zinc-600 transition-colors hover:text-black"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
