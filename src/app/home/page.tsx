"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckinList } from "~/_components/ui/checkin-list";
import { HomeEmpty, HomeHeader, HomeSkeleton } from "~/_components/ui/home";
import { Mosaic } from "~/_components/ui/mosaic";
import { MoodTracker } from "~/_components/ui/mood-tracker";
import { Card, Stat } from "~/_components/ui/primitives";
import { Sidebar } from "~/_components/ui/sidebar";
import { useGraphData } from "~/hooks/use-graph-data";
import { useHabitCompletion } from "~/hooks/use-habit-completion";
import { CATEGORY_IDS, CATEGORY_LABELS } from "~/lib/constants";
import { getCurrentYearRange, getTodayDate } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = useMemo(() => getTodayDate(), []);
  const dateRange = useMemo(() => getCurrentYearRange(), []);

  const {
    data: habitsWithStatus,
    isError: habitsError,
    isLoading: habitsLoading,
  } = api.completion.getForDate.useQuery({ date: today }, { enabled: !!today });

  const { data: stats } = api.completion.getStatsForDate.useQuery(
    { date: today },
    { enabled: !!today },
  );

  const {
    data: completionsData,
    isError: completionsError,
    isLoading: completionsLoading,
  } = api.completion.getMyCompletions.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: overallStats, isError: statsError } =
    api.completion.getOverallStats.useQuery();

  const graphData = useGraphData(completionsData);
  const { handleToggle, toggleMutation } = useHabitCompletion({
    today,
    dateRange,
  });

  // getMyCompletions is optimistically updated in use-habit-completion, so
  // today's tile already reflects a check-off. This just pulses it when the
  // count changes.
  const completedToday =
    habitsWithStatus?.filter((h) => h.isCompleted).length ?? 0;
  const [pulseToday, setPulseToday] = useState(false);
  const prevCompleted = useRef<number | null>(null);
  const hasLoaded = habitsWithStatus !== undefined;

  useEffect(() => {
    if (!hasLoaded) return; // not loaded yet
    if (prevCompleted.current === null) {
      // first real load: seed, don't pulse
      prevCompleted.current = completedToday;
      return;
    }
    const increased = completedToday > prevCompleted.current;
    prevCompleted.current = completedToday;

    if (!increased) {
      // decrease (or a same-count re-render, e.g. a background refetch):
      // clear any in-flight pulse so it can't get stranded on.
      setPulseToday(false);
      return;
    }

    setPulseToday(true);
    const t = setTimeout(() => setPulseToday(false), 500);
    return () => clearTimeout(t);
  }, [completedToday, hasLoaded]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  if (status === "loading" || habitsLoading) {
    return (
      <div className="flex min-h-screen bg-[var(--color-canvas)]">
        <div className="flex-1 md:ml-60">
          <main className="mx-auto max-w-4xl px-5 pt-8 pb-24 sm:px-6 lg:px-8">
            <HomeSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const hasError = habitsError || completionsError || statsError;
  const hasHabits = (habitsWithStatus?.length ?? 0) > 0;

  const counts = CATEGORY_IDS.reduce(
    (acc, id) => {
      acc[id] = stats?.byCategory.find((c) => c.category.id === id)?.count ?? 0;
      return acc;
    },
    {} as Record<(typeof CATEGORY_IDS)[number], number>,
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Sidebar user={session.user} />

      <div className="flex-1 md:ml-60">
        <main className="mx-auto flex max-w-4xl flex-col gap-3 px-5 pt-8 pb-24 sm:px-6 lg:px-8">
          {hasError && (
            <div
              role="alert"
              className="rounded-[var(--radius-control)] border border-[var(--color-body)]/30 bg-[var(--color-body)]/10 px-4 py-3 text-[13px] font-semibold text-[var(--color-body-ink)]"
            >
              Something went wrong loading your data. Please refresh the page.
            </div>
          )}

          <div className="animate-rise-in mb-1">
            <HomeHeader
              name={session.user.name?.split(" ")[0] ?? "friend"}
              streak={overallStats?.currentStreak ?? 0}
            />
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "60ms" }}>
            {hasHabits ? (
              <CheckinList
                habits={habitsWithStatus!}
                onToggle={handleToggle}
                isLoading={toggleMutation.isPending}
              />
            ) : (
              <HomeEmpty />
            )}
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "120ms" }}>
            <Mosaic
              completions={graphData}
              todayKey={today}
              pulseToday={pulseToday}
              isLoading={completionsLoading}
            />
          </div>

          <div
            className="animate-rise-in grid grid-cols-3 gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <Card>
              <Stat value={`${overallStats?.weekPercentage ?? 0}%`} label="This week" />
            </Card>
            <Card>
              <Stat value={overallStats?.totalCompleted ?? 0} label="Total days" />
            </Card>
            <Card>
              <Stat value={overallStats?.bestStreak ?? 0} label="Best streak" />
            </Card>
          </div>

          <div
            className="animate-rise-in grid grid-cols-3 gap-3"
            style={{ animationDelay: "240ms" }}
          >
            {CATEGORY_IDS.map((id) => (
              <Card key={id}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `var(--color-${id})` }}
                  />
                  <span className="text-eyebrow text-[var(--color-ink-muted)] uppercase">
                    {CATEGORY_LABELS[id]}
                  </span>
                </div>
                <div className="tabular text-stat">{counts[id]}</div>
              </Card>
            ))}
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "300ms" }}>
            <MoodTracker />
          </div>
        </main>
      </div>
    </div>
  );
}
