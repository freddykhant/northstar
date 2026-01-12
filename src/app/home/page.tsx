"use client";

import { Settings, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { api } from "~/trpc/react";

type CategoryId = "mind" | "body" | "soul";

interface DayData {
  date: string;
  categories: {
    mind: boolean;
    body: boolean;
    soul: boolean;
  };
}

function HabitGraph({ completions }: { completions: DayData[] }) {
  const categoryEmojis = {
    mind: "🧠",
    body: "💪",
    soul: "✨",
  };

  const categoryColors = {
    mind: "bg-blue-500",
    body: "bg-red-500",
    soul: "bg-purple-500",
  };

  const categoryLabels = {
    mind: "Mind",
    body: "Body",
    soul: "Soul",
  };

  // Get the last 60 days
  const days = useMemo(() => {
    const result: string[] = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push(date.toISOString().split("T")[0]!);
    }
    return result;
  }, []);

  // Create a map for quick lookup
  const completionMap = useMemo(() => {
    const map = new Map<string, DayData["categories"]>();
    completions.forEach((day) => {
      map.set(day.date, day.categories);
    });
    return map;
  }, [completions]);

  const categories: CategoryId[] = ["mind", "body", "soul"];

  // Calculate total completions for insight
  const totalCompletions = useMemo(() => {
    let count = 0;
    completions.forEach((day) => {
      if (day.categories.mind) count++;
      if (day.categories.body) count++;
      if (day.categories.soul) count++;
    });
    return count;
  }, [completions]);

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl">
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-xl font-bold text-white">Activity</h2>
            <p className="text-sm text-zinc-500">Last 60 days of progress</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalCompletions}</div>
            <div className="text-xs text-zinc-500">total completions</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex gap-4">
          {/* Category labels */}
          <div className="flex flex-col justify-around py-2">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex h-4 items-center gap-2 text-xs font-medium text-zinc-400"
              >
                <span>{categoryEmojis[cat]}</span>
                <span className="capitalize">{categoryLabels[cat]}</span>
              </div>
            ))}
          </div>

          {/* Graph grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1">
              {days.map((date) => {
                const dayData = completionMap.get(date);
                return (
                  <div key={date} className="flex flex-col gap-1">
                    {categories.map((cat) => {
                      const isComplete = dayData?.[cat] ?? false;
                      return (
                        <div
                          key={`${date}-${cat}`}
                          className={`h-4 w-4 rounded-sm transition-all hover:scale-110 ${
                            isComplete
                              ? `${categoryColors[cat]} opacity-100 shadow-sm`
                              : "bg-zinc-800 opacity-30"
                          }`}
                          title={`${date} - ${categoryLabels[cat]}: ${
                            isComplete ? "Completed" : "Not completed"
                          }`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }, []);

  // Fetch habits with completion status for today
  const { data: habitsWithStatus, refetch } =
    api.completion.getForDate.useQuery({ date: today! }, { enabled: !!today });

  // Fetch today's stats
  const { data: stats } = api.completion.getStatsForDate.useQuery(
    { date: today! },
    { enabled: !!today },
  );

  // Fetch completion data for the past 60 days
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 59);
    return {
      startDate: start.toISOString().split("T")[0]!,
      endDate: end.toISOString().split("T")[0]!,
    };
  }, []);

  const { data: completionsData } = api.completion.getMyCompletions.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Transform completions data for the graph
  const graphData = useMemo(() => {
    if (!completionsData) return [];

    // Group completions by date and category
    const dataByDate = new Map<
      string,
      { mind: boolean; body: boolean; soul: boolean }
    >();

    completionsData.forEach((completion) => {
      const dateKey = completion.completedDate;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { mind: false, body: false, soul: false });
      }
      const categoryId = completion.habit.category.id as CategoryId;
      dataByDate.get(dateKey)![categoryId] = true;
    });

    // Convert to array format
    return Array.from(dataByDate.entries()).map(([date, categories]) => ({
      date,
      categories,
    }));
  }, [completionsData]);

  // Toggle completion mutation
  const toggleMutation = api.completion.toggle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const categoryEmojis = {
    mind: "🧠",
    body: "💪",
    soul: "✨",
  };

  const categoryColors = {
    mind: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    body: "bg-red-500/20 text-red-300 border-red-500/30",
    soul: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  // authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Conditional returns AFTER all hooks
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-zinc-400">Loading...</div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleToggle = (habitId: number) => {
    toggleMutation.mutate({ habitId, date: today! });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const completedCount =
    habitsWithStatus?.filter((h) => h.isCompleted).length ?? 0;
  const totalCount = habitsWithStatus?.length ?? 0;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Enhanced Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.4) 0%, transparent 60%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

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
              onClick={handleSignOut}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-400 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-300"
            >
              Sign Out
            </button>
          </div>
        </nav>

        {/* Greeting Header */}
        <div className="mb-10">
          <h1 className="mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl font-bold text-transparent">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-lg text-zinc-400">{formatDate(today!)}</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Graph (takes 2 columns) */}
          <div className="lg:col-span-2">
            {/* Stats Overview Cards */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              {/* Mind Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 backdrop-blur-xl transition-all hover:border-blue-500/30">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="relative">
                  <div className="mb-2 text-3xl">🧠</div>
                  <div className="mb-1 text-sm font-medium text-blue-300">
                    Mind
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.byCategory.find((c) => c.category.id === "mind")
                      ?.count ?? 0}
                  </div>
                  <div className="text-xs text-zinc-500">completed today</div>
                </div>
              </div>

              {/* Body Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5 p-5 backdrop-blur-xl transition-all hover:border-red-500/30">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-500/20 blur-3xl" />
                <div className="relative">
                  <div className="mb-2 text-3xl">💪</div>
                  <div className="mb-1 text-sm font-medium text-red-300">
                    Body
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.byCategory.find((c) => c.category.id === "body")
                      ?.count ?? 0}
                  </div>
                  <div className="text-xs text-zinc-500">completed today</div>
                </div>
              </div>

              {/* Soul Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 backdrop-blur-xl transition-all hover:border-purple-500/30">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="relative">
                  <div className="mb-2 text-3xl">✨</div>
                  <div className="mb-1 text-sm font-medium text-purple-300">
                    Soul
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.byCategory.find((c) => c.category.id === "soul")
                      ?.count ?? 0}
                  </div>
                  <div className="text-xs text-zinc-500">completed today</div>
                </div>
              </div>
            </div>

            {/* Activity Graph */}
            <HabitGraph completions={graphData} />
          </div>

          {/* Right Column - Today's Checklist */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {habitsWithStatus && habitsWithStatus.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl">
                  {/* Checklist Header */}
                  <div className="border-b border-zinc-800 p-6">
                    <h2 className="mb-3 text-xl font-bold text-white">
                      Today&apos;s Focus
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {completionPercentage}%
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      {completedCount} of {totalCount} completed
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="max-h-[600px] overflow-y-auto p-4">
                    <div className="space-y-2">
                      {habitsWithStatus.map((habit) => {
                        const categoryId = habit.category.id as CategoryId;
                        const categoryColor = categoryColors[categoryId];

                        return (
                          <label
                            key={habit.id}
                            className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent p-3 transition-all hover:border-zinc-800 hover:bg-zinc-800/50"
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
                                <span className="text-lg">
                                  {categoryEmojis[categoryId]}
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
                                <span
                                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${categoryColor}`}
                                >
                                  {categoryId}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/70 p-12 text-center backdrop-blur-xl">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
