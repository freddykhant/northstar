"use client";

import { Compass } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ActivityGraph } from "~/_components/ui/activity-graph";
import { CheckinList } from "~/_components/ui/checkin-list";
import { MoodTracker } from "~/_components/ui/mood-tracker";
import { Sidebar } from "~/_components/ui/sidebar";
import { useGraphData } from "~/hooks/use-graph-data";
import { useHabitCompletion } from "~/hooks/use-habit-completion";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_HEX,
  CATEGORY_IDS,
  CATEGORY_LABELS,
} from "~/lib/constants";
import { getCurrentYearRange, getTodayDate } from "~/lib/utils";
import { api } from "~/trpc/react";

// ─────────────────────────────────────────────────────────────
// Journal helpers
// ─────────────────────────────────────────────────────────────

const ORDINALS = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
  "twenty-first",
  "twenty-second",
  "twenty-third",
  "twenty-fourth",
  "twenty-fifth",
  "twenty-sixth",
  "twenty-seventh",
  "twenty-eighth",
  "twenty-ninth",
  "thirtieth",
  "thirty-first",
];

const EPIGRAPHS: Array<{ line: string; by: string }> = [
  {
    line: "We are what we repeatedly do.",
    by: "Aristotle",
  },
  {
    line: "How we spend our days is, of course, how we spend our lives.",
    by: "Annie Dillard",
  },
  {
    line: "It is in your power, every day, to choose again.",
    by: "Marcus Aurelius",
  },
  {
    line: "Attention is the rarest and purest form of generosity.",
    by: "Simone Weil",
  },
  {
    line: "Tell me, what is it you plan to do with your one wild and precious life?",
    by: "Mary Oliver",
  },
  {
    line: "Discipline is choosing between what you want now and what you want most.",
    by: "Abraham Lincoln",
  },
  {
    line: "The small daily action is the source of any real ambition.",
    by: "—",
  },
];

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((now - start) / 86400000);
}

// ─────────────────────────────────────────────────────────────
// Inline editorial components
// ─────────────────────────────────────────────────────────────

function CompassOrnament() {
  return (
    <div className="flex items-baseline gap-2 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
      <Compass
        size={14}
        weight="duotone"
        className="text-[var(--color-ember)]"
      />
      <span
        className="font-serif text-[14px] italic tracking-tight"
        style={{ fontOpticalSizing: "auto" }}
      >
        northstar
      </span>
    </div>
  );
}

function FolioNumber({ n }: { n: number }) {
  return (
    <span className="tabular text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
      p. {n.toString().padStart(3, "0")}
    </span>
  );
}

function StarDivider({ width = 96 }: { width?: number }) {
  return (
    <div
      aria-hidden
      className="flex items-center gap-3 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
    >
      <span
        className="block h-px bg-[var(--color-ink-muted)]/40 dark:bg-[var(--color-ink-dark-muted)]/40"
        style={{ width }}
      />
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        className="text-[var(--color-ember)]"
      >
        <path
          d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
          fill="currentColor"
        />
      </svg>
      <span
        className="block h-px bg-[var(--color-ink-muted)]/40 dark:bg-[var(--color-ink-dark-muted)]/40"
        style={{ width }}
      />
    </div>
  );
}

function JournalDate({ date }: { date: Date }) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const ordinal = ORDINALS[day] ?? `${day}th`;

  return (
    <div>
      <p className="mb-3 font-serif text-[12px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
        {weekday}
      </p>
      <h1
        className="font-serif text-[64px] leading-[0.95] font-medium tracking-tight sm:text-[88px]"
        style={{
          fontOpticalSizing: "auto",
          letterSpacing: "-0.03em",
        }}
      >
        <span className="italic text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
          the {ordinal}
        </span>
        <br />
        <span className="text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
          of {month}
        </span>
      </h1>
      <p className="mt-4 tabular text-[12px] tracking-[0.32em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
        {year}
      </p>
    </div>
  );
}

function Epigraph({ index }: { index: number }) {
  const e = EPIGRAPHS[index % EPIGRAPHS.length]!;
  return (
    <figure>
      <blockquote
        className="font-serif text-[18px] leading-[1.5] italic text-[var(--color-ink)] sm:text-[20px] dark:text-[var(--color-ink-dark)]"
        style={{ fontOpticalSizing: "auto", textWrap: "balance" }}
      >
        &ldquo;{e.line}&rdquo;
      </blockquote>
      <figcaption
        className="mt-3 text-[11px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]"
      >
        — {e.by}
      </figcaption>
    </figure>
  );
}

function SectionHeader({
  numeral,
  marginalia,
  title,
}: {
  numeral: string;
  marginalia: string;
  title: string;
}) {
  return (
    <header className="mb-6 grid grid-cols-1 gap-2 lg:grid-cols-[180px_1fr] lg:gap-12">
      <p className="font-serif text-[12px] tracking-[0.08em] text-[var(--color-ink-muted)] italic lg:pt-2 lg:text-right dark:text-[var(--color-ink-dark-muted)]">
        {marginalia}
      </p>
      <h2
        className="font-serif text-[26px] leading-none font-medium italic text-[var(--color-ink)] sm:text-[30px] dark:text-[var(--color-ink-dark)]"
        style={{ fontOpticalSizing: "auto", letterSpacing: "-0.01em" }}
      >
        <span
          className="mr-3 tabular text-[var(--color-ember)] not-italic"
          style={{ fontFeatureSettings: '"smcp"' }}
        >
          {numeral}.
        </span>
        {title}
      </h2>
    </header>
  );
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-[180px_1fr] lg:gap-12">
      <div aria-hidden className="hidden lg:block" />
      <div>{children}</div>
    </div>
  );
}

function Reckoning({
  currentStreak,
  weekPercentage,
  totalCompleted,
  bestStreak,
}: {
  currentStreak: number;
  weekPercentage: number;
  totalCompleted: number;
  bestStreak: number;
}) {
  const items = [
    { label: "Streak", value: currentStreak, unit: "days" },
    { label: "Week", value: weekPercentage, unit: "percent" },
    { label: "Total", value: totalCompleted, unit: "checks" },
    { label: "Best", value: bestStreak, unit: "days" },
  ];
  return (
    <div className="grid grid-cols-2 gap-y-8 border-y border-black/8 py-8 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-black/8 dark:border-white/8 dark:sm:divide-white/8">
      {items.map((it) => (
        <div key={it.label} className="px-2 text-center first:pl-0 last:pr-0">
          <div
            className="tabular font-serif text-[44px] leading-none font-medium text-[var(--color-ink)] sm:text-[52px] dark:text-[var(--color-ink-dark)]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "-0.03em",
            }}
          >
            {it.value}
          </div>
          <div className="mt-3 font-serif text-[12px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase italic dark:text-[var(--color-ink-dark-muted)]">
            {it.label}
          </div>
          <div className="mt-1 text-[10px] tracking-[0.12em] text-[var(--color-ink-muted)]/70 uppercase dark:text-[var(--color-ink-dark-muted)]/70">
            {it.unit}
          </div>
        </div>
      ))}
    </div>
  );
}

function ThreeGardens({
  counts,
}: {
  counts: Record<(typeof CATEGORY_IDS)[number], number>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
      {CATEGORY_IDS.map((id) => (
        <article key={id} className="border-l border-black/8 pl-4 dark:border-white/8">
          <div className="mb-2 flex items-baseline gap-2">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_HEX[id] }}
            />
            <h3
              className="font-serif text-[11px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]"
            >
              {CATEGORY_LABELS[id]}
            </h3>
          </div>
          <div
            className="tabular font-serif text-[44px] leading-none font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
            style={{
              fontOpticalSizing: "auto",
              letterSpacing: "-0.03em",
            }}
          >
            {counts[id]}
          </div>
          <p className="mt-3 font-serif text-[12px] leading-[1.5] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
            {CATEGORY_DESCRIPTIONS[id]}
          </p>
        </article>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = useMemo(() => getTodayDate(), []);
  const dateRange = useMemo(() => getCurrentYearRange(), []);
  const todayDate = useMemo(() => new Date(), []);
  const folio = useMemo(() => dayOfYear(todayDate), [todayDate]);

  const { data: habitsWithStatus, isError: habitsError } =
    api.completion.getForDate.useQuery({ date: today }, { enabled: !!today });

  const { data: stats } = api.completion.getStatsForDate.useQuery(
    { date: today },
    { enabled: !!today },
  );

  const { data: completionsData, isError: completionsError } =
    api.completion.getMyCompletions.useQuery({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

  const { data: overallStats, isError: statsError } =
    api.completion.getOverallStats.useQuery();

  const graphData = useGraphData(completionsData);
  const { handleToggle, justCompleted, toggleMutation } = useHabitCompletion({
    today,
    dateRange,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] text-[var(--color-ink)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]">
        <div className="font-serif text-[14px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
          opening the journal…
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  const hasError = habitsError ?? completionsError ?? statsError;

  const currentStreak = overallStats?.currentStreak ?? 0;
  const weekPercentage = overallStats?.weekPercentage ?? 0;
  const totalCompleted = overallStats?.totalCompleted ?? 0;
  const bestStreak = overallStats?.bestStreak ?? 0;

  const counts = CATEGORY_IDS.reduce(
    (acc, id) => {
      acc[id] =
        stats?.byCategory.find((c) => c.category.id === id)?.count ?? 0;
      return acc;
    },
    {} as Record<(typeof CATEGORY_IDS)[number], number>,
  );

  return (
    <div className="relative flex min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]">
      <Sidebar user={session.user} />

      <div className="relative flex-1 md:ml-64">
        <main className="max-w-5xl px-6 pt-12 pb-32 sm:pt-16 sm:pl-16 sm:pr-12 lg:pl-24">
          {/* Folio chrome */}
          <div className="mb-16 flex items-baseline justify-between">
            <CompassOrnament />
            <FolioNumber n={folio} />
          </div>

          {hasError && (
            <div className="mb-12 rounded-[6px] border border-[var(--color-ember)]/30 bg-[var(--color-ember)]/8 px-3 py-2 text-[12px] text-[var(--color-ember)]">
              Something went wrong loading your data. Please refresh the page.
            </div>
          )}

          {/* The date — the big editorial gesture */}
          <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr] lg:gap-12">
            <p className="font-serif text-[12px] tracking-[0.08em] text-[var(--color-ink-muted)] italic lg:pt-4 lg:text-right dark:text-[var(--color-ink-dark-muted)]">
              good {timeOfDay()}, <br />
              {session.user.name?.split(" ")[0] ?? "friend"}
            </p>
            <JournalDate date={todayDate} />
          </section>

          {/* Epigraph */}
          <section className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr] lg:gap-12">
            <p className="font-serif text-[12px] tracking-[0.08em] text-[var(--color-ink-muted)] italic lg:pt-2 lg:text-right dark:text-[var(--color-ink-dark-muted)]">
              today&apos;s epigraph
            </p>
            <Epigraph index={folio} />
          </section>

          <div className="mb-20 flex justify-center">
            <StarDivider />
          </div>

          {/* I. The reckoning */}
          <section className="mb-20">
            <SectionHeader
              numeral="I"
              marginalia="on practice"
              title="The reckoning"
            />
            <SectionBody>
              <Reckoning
                currentStreak={currentStreak}
                weekPercentage={weekPercentage}
                totalCompleted={totalCompleted}
                bestStreak={bestStreak}
              />
            </SectionBody>
          </section>

          {/* II. The cultivation */}
          <section className="mb-20">
            <SectionHeader
              numeral="II"
              marginalia="three gardens"
              title="The cultivation"
            />
            <SectionBody>
              <ThreeGardens counts={counts} />
            </SectionBody>
          </section>

          {/* III. The year so far */}
          <section className="mb-20">
            <SectionHeader
              numeral="III"
              marginalia="an atlas of days"
              title="The year so far"
            />
            <SectionBody>
              <ActivityGraph completions={graphData} />
            </SectionBody>
          </section>

          {/* IV. The practice */}
          <section className="mb-20">
            <SectionHeader
              numeral="IV"
              marginalia="today, in particular"
              title="The practice"
            />
            <SectionBody>
              {habitsWithStatus && habitsWithStatus.length > 0 ? (
                <CheckinList
                  habits={habitsWithStatus}
                  onToggle={handleToggle}
                  justCompleted={justCompleted}
                  isLoading={toggleMutation.isPending}
                />
              ) : (
                <div className="rounded-[12px] border border-dashed border-black/10 p-12 text-center dark:border-white/10">
                  <Compass
                    size={28}
                    weight="duotone"
                    className="mx-auto mb-4 text-[var(--color-ember)]"
                  />
                  <h3
                    className="mb-2 font-serif text-[22px] italic text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
                    style={{ fontOpticalSizing: "auto" }}
                  >
                    The page is still blank.
                  </h3>
                  <p className="mb-6 font-serif text-[14px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                    Begin with one small practice. The rest follows.
                  </p>
                  <Link
                    href="/habits"
                    className="inline-block rounded-[6px] bg-[var(--color-ember)] px-5 py-2.5 text-[13px] font-medium text-[#fbf9f3] hover:opacity-90"
                  >
                    Inscribe your first habit
                  </Link>
                </div>
              )}
            </SectionBody>
          </section>

          {/* V. The sky */}
          <section className="mb-20">
            <SectionHeader
              numeral="V"
              marginalia="on weather"
              title="The sky"
            />
            <SectionBody>
              <MoodTracker />
            </SectionBody>
          </section>

          {/* Finis */}
          <footer className="mt-24 flex flex-col items-center gap-4">
            <StarDivider width={48} />
            <p
              className="font-serif text-[14px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]"
              style={{ fontOpticalSizing: "auto" }}
            >
              finis
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
