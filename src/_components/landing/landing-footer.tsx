import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { Wordmark } from "./wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-hairline)] px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <BrandMark size={22} />
          <Wordmark className="text-[16px]" />
        </div>

        <nav className="flex items-center gap-5 text-[14px] text-[var(--color-ink-muted)]">
          <Link href="/signin" className="hover:text-[var(--color-ink)]">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-[var(--color-ink)]">
            Sign up
          </Link>
        </nav>

        <p className="text-[13px] text-[var(--color-ink-faint)]">
          © 2026 Northstar. Built for consistency.
        </p>
      </div>
    </footer>
  );
}
