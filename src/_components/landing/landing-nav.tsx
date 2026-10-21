import Link from "next/link";
import { Squii } from "~/_components/brand/squii";
import { Wordmark } from "~/_components/brand/wordmark";

export function LandingNav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      {/* Exactly one accessible name in this lockup. The Wordmark is already a
          role="img" labelled "squii", so the Link carries no aria-label of its
          own — an aria-label on the Link would override the Wordmark's and make
          it dead weight, and naming both double-announces. The glyph is
          decorative (no `title`), so the link announces as "squii, link". */}
      <Link href="/" className="flex items-center gap-2.5">
        {/* Heights 26/30 are optical, not ratios. The lockup's viewBox is 44
            tall, but its ink runs y 3.1 to 41.6 (eye-dots to the `q` descender,
            counting the 2.6 half-stroke), about 0.875 of the box. Centreline
            arithmetic that ignores strokeWidth and the dot radius undercounts
            that, so the wordmark is about the same height as the glyph. */}
        <Squii size={26} />
        <Wordmark height={30} />
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/signin"
          className="rounded-full bg-[var(--color-sunken)] px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-hairline)]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13px] font-semibold text-[var(--color-canvas)] hover:opacity-90"
        >
          Start tracking
        </Link>
      </div>
    </nav>
  );
}
