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
        isScrolled ? "scale-95" : "scale-100"
      }`}
    >
      <div
        className={`flex items-center gap-6 rounded-full border px-6 py-3 backdrop-blur-xl transition-all duration-500 ${
          isScrolled
            ? "border-white/20 bg-zinc-900/90 shadow-2xl"
            : "border-white/10 bg-zinc-900/50 shadow-lg"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-red-500 to-purple-500 shadow-lg">
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
          <span className="text-sm font-bold text-white">Northstar</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" />

        {/* Nav Links */}
        <div className="hidden items-center gap-5 sm:flex">
          <a
            href="#features"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            How it works
          </a>
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-white/10 sm:block" />

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="text-sm text-zinc-300 transition-colors hover:text-white"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="group relative overflow-hidden rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/20"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 via-red-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
