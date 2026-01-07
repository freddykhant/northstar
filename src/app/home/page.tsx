"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { Settings } from "lucide-react";

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

  // authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

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

  // Group habits by category
  const habitsByCategory = useMemo(() => {
    if (!habitsWithStatus) return { mind: [], body: [], soul: [] };

    return habitsWithStatus.reduce(
      (acc, habit) => {
        const categoryId = habit.category.id as "mind" | "body" | "soul";
        acc[categoryId].push(habit);
        return acc;
      },
      { mind: [], body: [], soul: [] } as Record<
        "mind" | "body" | "soul",
        typeof habitsWithStatus
      >,
    );
  }, [habitsWithStatus]);

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
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,66,0.15)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(120,80,50,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(100,70,50,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-white">Northstar</h1>
            <p className="text-sm text-zinc-400">{formatDate(today!)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/habits"
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Settings className="h-4 w-4" />
              Manage Habits
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && stats.totalCompletions > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Today&apos;s Progress
            </h2>
            <div className="flex gap-6">
              <div>
                <div className="text-3xl font-bold text-white">
                  {stats.totalCompletions}
                </div>
                <div className="text-sm text-zinc-400">Total Completions</div>
              </div>
              {stats.byCategory.map((cat) => (
                <div key={cat.category.id}>
                  <div className="text-2xl font-semibold text-white">
                    {cat.count}
                  </div>
                  <div className="text-sm text-zinc-400 capitalize">
                    {cat.category.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits Checklist */}
        <div className="space-y-6">
          {(["mind", "body", "soul"] as const).map((categoryId) => {
            const categoryHabits = habitsByCategory[categoryId];
            if (categoryHabits.length === 0) return null;

            const categoryName = categoryHabits[0]?.category.name ?? categoryId;

            return (
              <div
                key={categoryId}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm"
              >
                <h3 className="mb-4 text-lg font-semibold text-white capitalize">
                  {categoryName}
                </h3>
                <div className="space-y-3">
                  {categoryHabits.map((habit) => (
                    <label
                      key={habit.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-zinc-800/50"
                    >
                      <input
                        type="checkbox"
                        checked={habit.isCompleted}
                        onChange={() => handleToggle(habit.id)}
                        disabled={toggleMutation.isPending}
                        className="mt-0.5 h-5 w-5 cursor-pointer rounded border-zinc-600 bg-zinc-800 text-white focus:ring-2 focus:ring-white focus:ring-offset-0 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            habit.isCompleted
                              ? "text-zinc-400 line-through"
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
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ELink
              href="/habits"
              className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Create Habit
            </LinkName="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-sm">
            <h2 className="mb-2 text-xl font-semibold text-white">
              No habits yet
            </h2>
            <p className="mb-6 text-zinc-400">
              Create your first habit to start tracking your progress
            </p>
            <button className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-zinc-200">
              Create Habit
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
