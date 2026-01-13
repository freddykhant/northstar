"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ActivityGraph } from "~/components/ui/activity-graph";
import { CategoryStatCard } from "~/components/ui/category-stat-card";
import { CheckinList } from "~/components/ui/checkin-list";
import { GlassCard } from "~/components/ui/glass-card";
import { GradientBackground } from "~/components/ui/gradient-background";
import { NorthstarHeader } from "~/components/ui/northstar-header";
import { StatsCards } from "~/components/ui/stats-cards";
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-zinc-400">Loading...</div>
      </main>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return null;
  }

  // TODO: Calculate these values from real data
  const currentStreak = 0; // Placeholder
  const weekPercentage = 0; // Placeholder
  const totalCompleted = 0; // Placeholder
  const bestStreak = 0; // Placeholder

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Background */}
      <GradientBackground />

      {/* Header */}
      <NorthstarHeader />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Greeting Header */}
        <div className="mb-10">
          <h1 className="mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl font-bold text-transparent">
            {getGreeting()}, {session.user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-lg text-zinc-400">{formatDate(today)}</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Graph (takes 2 columns) */}
          <div className="lg:col-span-2">
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
            <ActivityGraph completions={graphData} todayDate={today} />
          </div>

          {/* Right Column - Today's Checklist */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {habitsWithStatus && habitsWithStatus.length > 0 ? (
                <GlassCard className="border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
                  <h2 className="mb-6 text-xl font-bold text-white">
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
                <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 text-6xl">🌟</div>
                  <h2 className="mb-2 text-xl font-bold text-white">
                    No habits yet
                  </h2>
                  <p className="mb-6 text-sm text-zinc-400">
                    Create your first habit to start building consistency
                  </p>
                  <Link
                    href="/habits"
                    className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
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
