"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Compass } from "@phosphor-icons/react";
import { ActivityGraph } from "~/_components/ui/activity-graph";
import { CategoryStatCard } from "~/_components/ui/category-stat-card";
import { CheckinList } from "~/_components/ui/checkin-list";
import { MoodTracker } from "~/_components/ui/mood-tracker";
import { Sidebar } from "~/_components/ui/sidebar";
import { StatsCards } from "~/_components/ui/stats-cards";
import { useGraphData } from "~/hooks/use-graph-data";
import { useHabitCompletion } from "~/hooks/use-habit-completion";
import { CATEGORY_IDS } from "~/lib/constants";
import {
  formatDate,
  getCurrentYearRange,
  getGreeting,
  getTodayDate,
} from "~/lib/utils";
import { api } from "~/trpc/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = useMemo(() => getTodayDate(), []);
  const dateRange = useMemo(() => getCurrentYearRange(), []);

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
        <div className="text-[13px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
          Loading…
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

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="relative flex min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]">
      <Sidebar user={session.user} />

      <div className="relative flex-1 md:ml-64">
        <main className="mx-auto max-w-3xl px-6 py-16">
          {hasError && (
            <div className="mb-8 rounded-[6px] border border-[var(--color-ember)]/30 bg-[var(--color-ember)]/8 px-3 py-2 text-[12px] text-[var(--color-ember)]">
              Something went wrong loading your data. Please refresh the page.
            </div>
          )}

          {/* Greeting */}
          <header className="mb-12">
            <h1
              className="font-serif text-[40px] leading-[1.05] font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
              style={{
                fontOpticalSizing: "auto",
                letterSpacing: "-0.02em",
              }}
            >
              {getGreeting()}, {firstName}.
            </h1>
            <p className="mt-3 text-[13px] tracking-[0.04em] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
              {formatDate(today)}
            </p>
          </header>

          {/* Metric strip */}
          <section className="mb-10">
            <StatsCards
              currentStreak={currentStreak}
              weekPercentage={weekPercentage}
              totalCompleted={totalCompleted}
              bestStreak={bestStreak}
            />
          </section>

          {/* Category breakdown */}
          <section className="mb-10 grid grid-cols-3 gap-4">
            {CATEGORY_IDS.map((categoryId) => {
              const count =
                stats?.byCategory.find((c) => c.category.id === categoryId)
                  ?.count ?? 0;
              return (
                <CategoryStatCard
                  key={categoryId}
                  categoryId={categoryId}
                  count={count}
                />
              );
            })}
          </section>

          {/* Activity graph */}
          <section className="mb-10">
            <ActivityGraph completions={graphData} />
          </section>

          {/* Today's check-ins */}
          <section className="mb-10">
            {habitsWithStatus && habitsWithStatus.length > 0 ? (
              <div className="rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-6 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
                <CheckinList
                  habits={habitsWithStatus}
                  onToggle={handleToggle}
                  justCompleted={justCompleted}
                  isLoading={toggleMutation.isPending}
                />
              </div>
            ) : (
              <div className="rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] p-12 text-center dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
                <Compass
                  size={32}
                  weight="duotone"
                  className="mx-auto mb-4 text-[var(--color-ember)]"
                />
                <h2
                  className="mb-2 font-serif text-[22px] font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
                  style={{ fontOpticalSizing: "auto" }}
                >
                  Nothing to track yet
                </h2>
                <p className="mb-6 font-serif text-[14px] italic text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
                  Begin with a single habit. Consistency is the rest.
                </p>
                <Link
                  href="/habits"
                  className="inline-block rounded-[6px] bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-paper)] hover:bg-black dark:bg-[var(--color-ink-dark)] dark:text-[var(--color-paper-dark)] dark:hover:bg-white"
                >
                  Create your first habit
                </Link>
              </div>
            )}
          </section>

          {/* Mood tracker */}
          <section className="mb-10">
            <MoodTracker />
          </section>
        </main>
      </div>
    </div>
  );
}
