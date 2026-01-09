"use client";

import { Settings, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { api } from "~/trpc/react";

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(38, 35, 32, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 45%, rgba(45, 40, 35, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.5) 0%, transparent 60%)
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
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 flex items-center gap-2 text-4xl font-bold text-white">
              <Sparkles className="h-9 w-9 text-yellow-400" />
              Northstar
            </h1>
            <p className="text-sm text-zinc-400">{formatDate(today!)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/habits"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300 transition-all hover:bg-zinc-800"
            >
              <Settings className="h-4 w-4" />
              Manage
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300 transition-all hover:bg-zinc-800"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && stats.totalCompletions > 0 && (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-3xl font-bold text-white">
                  {stats.totalCompletions}
                </div>
                <div className="text-sm text-zinc-400">completed today</div>
              </div>
              {stats.byCategory.map((cat) => (
                <div key={cat.category.id} className="flex items-center gap-2">
                  <span className="text-2xl">
                    {
                      categoryEmojis[
                        cat.category.id as "mind" | "body" | "soul"
                      ]
                    }
                  </span>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {cat.count}
                    </div>
                    <div className="text-xs text-zinc-500 capitalize">
                      {cat.category.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Checklist */}
        {habitsWithStatus && habitsWithStatus.length > 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h2 className="mb-6 text-xl font-bold text-white">
              Today&apos;s Checklist
            </h2>
            <div className="space-y-2">
              {habitsWithStatus.map((habit) => {
                const categoryId = habit.category.id as
                  | "mind"
                  | "body"
                  | "soul";
                const categoryColor = categoryColors[categoryId];

                return (
                  <label
                    key={habit.id}
                    className="group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all hover:bg-zinc-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={habit.isCompleted}
                      onChange={() => handleToggle(habit.id)}
                      disabled={toggleMutation.isPending}
                      className="h-5 w-5 cursor-pointer rounded-md border-zinc-600 bg-zinc-800 text-white transition-all focus:ring-2 focus:ring-white focus:ring-offset-0 disabled:opacity-50"
                    />
                    <div className="flex flex-1 items-center gap-3">
                      <span className="text-2xl">
                        {categoryEmojis[categoryId]}
                      </span>
                      <div className="flex-1">
                        <div
                          className={`font-medium transition-all ${
                            habit.isCompleted
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {habit.name}
                        </div>
                        {habit.description && (
                          <div className="text-sm text-zinc-500">
                            {habit.description}
                          </div>
                        )}
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryColor}`}
                      >
                        {categoryId}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/50 p-16">
            <div className="mb-4 text-6xl">🌟</div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              No habits yet
            </h2>
            <p className="mb-6 text-zinc-400">
              Create your first habit to start tracking your progress
            </p>
            <Link
              href="/habits"
              className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition-transform hover:scale-105"
            >
              Create
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
