"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ActivityGraph } from "~/_components/ui/activity-graph";
import { CategoryStatCard } from "~/_components/ui/category-stat-card";
import { CheckinList } from "~/_components/ui/checkin-list";
import { GlassCard } from "~/_components/ui/glass-card";
import { GradientBackground } from "~/_components/ui/gradient-background";
import { MoodTracker } from "~/_components/ui/mood-tracker";
import { NorthstarHeader } from "~/_components/ui/northstar-header";
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

  // Get today's date
  const today = useMemo(() => getTodayDate(), []);

  // Get date range for current year
  const dateRange = useMemo(() => getCurrentYearRange(), []);

  // Fetch data
  const { data: habitsWithStatus } = api.completion.getForDate.useQuery(
    { date: today },
    { enabled: !!today },
  );

  const { data: stats } = api.completion.getStatsForDate.useQuery(
    { date: today },
    { enabled: !!today },
  );

  const { data: completionsData } = api.completion.getMyCompletions.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: overallStats } = api.completion.getOverallStats.useQuery();

  // Transform completions data for the graph
  const graphData = useGraphData(completionsData);

  // Handle habit completion with optimistic updates
  const { handleToggle, justCompleted, toggleMutation } = useHabitCompletion({
    today,
    dateRange,
  });

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </main>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return null;
  }

  // Extract real stats from the query (with fallbacks)
  const currentStreak = overallStats?.currentStreak ?? 0;
  const weekPercentage = overallStats?.weekPercentage ?? 0;
  const totalCompleted = overallStats?.totalCompleted ?? 0;
  const bestStreak = overallStats?.bestStreak ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      {/* Background */}
      <GradientBackground />

      {/* Header */}
      <NorthstarHeader user={session.user} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Greeting Header */}
        <div className="mb-10">
          <h1 className="mb-2 bg-linear-to-r from-black via-zinc-700 to-zinc-400 bg-clip-text py-4 text-5xl font-bold text-transparent dark:from-white dark:via-zinc-100 dark:to-zinc-400">
            {getGreeting()}, {session.user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {formatDate(today)}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Graph (takes 2 columns) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Category Stats Overview Cards */}
            <div className="mb-6 grid grid-cols-3 gap-4">
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
            </div>

            {/* New Stats Cards */}
            <div className="mb-6">
              <StatsCards
                currentStreak={currentStreak}
                weekPercentage={weekPercentage}
                totalCompleted={totalCompleted}
                bestStreak={bestStreak}
              />
            </div>

            {/* Activity Graph */}
            <ActivityGraph completions={graphData} />

            {/* Mood Tracker */}
            <MoodTracker />
          </div>

          {/* Right Column - Today's Checklist */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {habitsWithStatus && habitsWithStatus.length > 0 ? (
                <GlassCard className="border border-zinc-200 bg-white p-6 backdrop-blur-sm dark:border-white/6 dark:bg-white/3">
                  <h2 className="mb-6 text-xl font-bold text-black dark:text-white">
                    Today&apos;s Focus
                  </h2>
                  <CheckinList
                    habits={habitsWithStatus}
                    onToggle={handleToggle}
                    justCompleted={justCompleted}
                    isLoading={toggleMutation.isPending}
                  />
                </GlassCard>
              ) : (
                <GlassCard className="flex flex-col items-center justify-center border border-zinc-200 bg-white p-12 text-center dark:border-white/6 dark:bg-white/3">
                  <div className="mb-4 text-6xl">🌟</div>
                  <h2 className="mb-2 text-xl font-bold text-black dark:text-white">
                    No habits yet
                  </h2>
                  <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                    Create your first habit to start building consistency
                  </p>
                  <Link
                    href="/habits"
                    className="inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
                  >
                    Create Habit
                  </Link>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
