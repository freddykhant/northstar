import Image from "next/image";
import { InteractiveYear } from "./interactive-year";

interface HeroProps {
  /** `YYYY-MM-DD`, resolved once on the server. See `parseDayKey`. */
  referenceKey: string;
}

export function Hero({ referenceKey }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-wash-from)] to-[var(--color-wash-to)] px-6 pt-10 pb-28">
      {/* Grain. Pure CSS, no asset — carried over from the previous design. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1
          className="animate-rise-in font-display text-[clamp(40px,6vw,64px)] leading-[1.05] font-normal tracking-[-0.02em] text-[var(--color-ink)]"
          style={{ textWrap: "balance" }}
        >
          Your year, in three colours.
        </h1>
        <p
          className="animate-rise-in mx-auto mt-5 max-w-xl text-[16px] leading-[1.6] text-[var(--color-ink)]"
          style={{
            animationDelay: "120ms",
            animationFillMode: "both",
            textWrap: "balance",
          }}
        >
          Mind, body, soul &mdash; one square a day. See which part of your life
          you&rsquo;re actually showing up for.
        </p>
      </div>

      <div
        className="animate-rise-in relative mx-auto mt-14 flex max-w-4xl flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:gap-8"
        style={{ animationDelay: "240ms", animationFillMode: "both" }}
      >
        {/* Squii's panel. `public/squid.png` is RGB with NO alpha, so its
            lavender is baked into the file — the panel is filled with
            --color-squii-ground, which is that exact sampled colour, and the
            render's edges disappear into it. It must never sit directly on the
            page background: in dark mode the page is aubergine and an
            unpanelled render would read as a light lavender square. The panel
            is the same lavender in both themes on purpose — it is a framed
            illustration, not a themed surface.

            DOM order puts Squii first so `flex-col-reverse` drops him
            BELOW-left of the mosaic on mobile and `sm:flex-row` seats him
            left of it from `sm:` up. He is decorative (empty alt): the mosaic
            beside him carries all the information.

            Explicit width/height plus `priority` matter here — the source is
            1254x1254 and 1.2MB, so it must be served as an optimised,
            correctly-sized image, and it is above the fold. */}
        <div className="shrink-0 overflow-hidden rounded-[24px] bg-[var(--color-squii-ground)] p-3 shadow-[var(--shadow-lift)]">
          <Image
            src="/squid.png"
            alt=""
            width={168}
            height={168}
            priority
            className="block h-[120px] w-[120px] rounded-[14px] sm:h-[168px] sm:w-[168px]"
          />
        </div>

        <div className="w-full min-w-0 rounded-[28px] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lift)] sm:flex-1 sm:p-8">
          <InteractiveYear referenceKey={referenceKey} />
        </div>
      </div>
    </section>
  );
}
