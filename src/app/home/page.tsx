"use client";

import { Settings, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { HabitGraph } from "~/components/features/habit-graph";
import { CategoryBadge } from "~/components/ui/category-badge";
import { CategoryStatCard } from "~/components/ui/category-stat-card";
import {
  GlassCard,
  GlassCardBody,
  GlassCardHeader,
} from "~/components/ui/glass-card";
import { GradientBackground } from "~/components/ui/gradient-background";
import { ProgressBarWithLabel } from "~/components/ui/progress-bar";
import { useGraphData } from "~/hooks/use-graph-data";
import { useHabitCompletion } from "~/hooks/use-habit-completion";
import { CATEGORY_EMOJIS, CATEGORY_IDS } from "~/lib/constants";
import type { CategoryId } from "~/lib/types";
import {
  calculateCompletionPercentage,
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

  // Calculate completion percentage
  const completedCount =
    habitsWithStatus?.filter((h) => h.isCompleted).length ?? 0;
  const totalCount = habitsWithStatus?.length ?? 0;
  const completionPercentage = calculateCompletionPercentage(
    completedCount,
    totalCount,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Background */}
      <GradientBackground />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Top Navigation Bar */}
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Northstar</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/habits"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-300 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800/70"
            >
              <Settings className="h-4 w-4" />
              Manage Habits
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-400 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-300"
            >
              Sign Out
            </button>
          </div>
        </nav>

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
            {/* Stats Overview Cards */}
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

            {/* Activity Graph */}
            <HabitGraph completions={graphData} todayDate={today} />
          </div>

          {/* Right Column - Today's Checklist */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {habitsWithStatus && habitsWithStatus.length > 0 ? (
                <GlassCard>
                  {/* Checklist Header */}
                  <GlassCardHeader>
                    <h2 className="mb-3 text-xl font-bold text-white">
                      Today&apos;s Focus
                    </h2>
                    <ProgressBarWithLabel
                      percentage={completionPercentage}
                      completedCount={completedCount}
                      totalCount={totalCount}
                    />
                  </GlassCardHeader>

                  {/* Checklist Items */}
                  <GlassCardBody className="max-h-[600px] overflow-y-auto p-4">
                    <div className="space-y-2">
                      {habitsWithStatus.map((habit) => {
                        const categoryId = habit.category.id as CategoryId;
                        const isJustCompleted = justCompleted.has(habit.id);

                        return (
                          <label
                            key={habit.id}
                            className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                              isJustCompleted
                                ? "scale-[1.02] border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/20"
                                : "border-transparent hover:border-zinc-800 hover:bg-zinc-800/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={habit.isCompleted}
                              onChange={() => handleToggle(habit.id)}
                              disabled={toggleMutation.isPending}
                              className="mt-0.5 h-5 w-5 cursor-pointer rounded-md border-zinc-600 bg-zinc-800 text-white transition-all focus:ring-2 focus:ring-white focus:ring-offset-0 disabled:opacity-50"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span
                                  className={`text-lg transition-transform duration-300 ${
                                    isJustCompleted ? "scale-125" : ""
                                  }`}
                                >
                                  {CATEGORY_EMOJIS[categoryId]}
                                </span>
                                <div
                                  className={`flex-1 text-sm font-medium transition-all ${
                                    habit.isCompleted
                                      ? "text-zinc-500 line-through"
                                      : "text-white"
                                  }`}
                                >
                                  {habit.name}
                                </div>
                              </div>
                              {habit.description && (
                                <div className="text-xs text-zinc-600">
                                  {habit.description}
                                </div>
                              )}
                              <div className="mt-1.5">
                                <CategoryBadge categoryId={categoryId} />
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </GlassCardBody>
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
