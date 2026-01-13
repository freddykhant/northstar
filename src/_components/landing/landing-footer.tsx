"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-linear-to-b from-zinc-50 to-zinc-100 px-4 py-24">
      <div className="mx-auto max-w-4xl text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex justify-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 via-red-500 to-purple-500 shadow-lg">
            <svg
              width="28"
              height="28"
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
        </motion.div>

        {/* Tagline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-4 text-4xl font-bold text-black sm:text-5xl"
        >
          Habits that set you
          <br />
          up for{" "}
          <span className="bg-linear-to-r from-blue-500 via-red-500 to-purple-500 bg-clip-text text-transparent">
            success
          </span>
          .
        </motion.h2>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 mb-16 inline-flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-2 py-2 shadow-lg"
        >
          <Link
            href="/signup"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
          >
            Get Started
          </Link>
          <span className="text-zinc-400">or</span>
          <Link
            href="/signin"
            className="px-4 py-3 font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Log In
          </Link>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 border-t border-zinc-200 pt-8 sm:flex-row sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 via-red-500 to-purple-500">
              <svg
                width="12"
                height="12"
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
            <span className="text-sm font-semibold text-black">Northstar</span>
          </div>

          <p className="text-sm text-zinc-500">
            © 2026 Northstar. Built for consistency.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
