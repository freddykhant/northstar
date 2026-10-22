import Link from "next/link";
import { Squii } from "~/_components/brand/squii";
import { Wordmark } from "~/_components/brand/wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-hairline)] px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Same arrangement as the nav: the Wordmark supplies the single
            accessible name, the glyph beside it is decorative. */}
        <div className="flex items-center gap-2.5">
          {/* Heights 22/26 are optical, not ratios. The lockup's viewBox is 44
              tall, but its ink runs y 3.1 to 41.6 (eye-dots to the `q` descender,
              counting the 2.6 half-stroke), about 0.875 of the box. Centreline
              arithmetic that ignores strokeWidth and the dot radius undercounts
              that, so the wordmark is about the same height as the glyph. */}
          <Squii size={22} />
          <Wordmark height={26} />
        </div>

        <nav className="flex items-center gap-5 text-[14px] text-[var(--color-ink-muted)]">
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center hover:text-[var(--color-ink)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center hover:text-[var(--color-ink)]"
          >
            Sign up
          </Link>
        </nav>

        <p className="text-[13px] text-[var(--color-ink-muted)]">
          © {new Date().getFullYear()} Squii. Built for consistency.
        </p>
      </div>
    </footer>
  );
}
