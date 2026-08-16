import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { Wordmark } from "./wordmark";

export function LandingNav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Northstar home">
        <BrandMark size={26} />
        <Wordmark />
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
