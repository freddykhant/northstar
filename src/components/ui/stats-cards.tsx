import { Calendar, Flame, Target, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  currentStreak: number;
  weekPercentage: number;
  totalCompleted: number;
  bestStreak: number;
}

export function StatsCards({
  currentStreak,
  weekPercentage,
  totalCompleted,
  bestStreak,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Current Streak",
      value: currentStreak.toString(),
      unit: "days",
      icon: Flame,
      color: "text-orange-400",
      bgGlow: "from-orange-500/20",
    },
    {
      label: "This Week",
      value: weekPercentage.toString(),
      unit: "%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/20",
    },
    {
      label: "Total Completed",
      value: totalCompleted.toString(),
      unit: "habits",
      icon: Target,
      color: "text-blue-400",
      bgGlow: "from-blue-500/20",
    },
    {
      label: "Best Streak",
      value: bestStreak.toString(),
      unit: "days",
      icon: Calendar,
      color: "text-purple-400",
      bgGlow: "from-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm"
        >
          {/* Subtle glow */}
          <div
            className={`bg-gradient-radial absolute -top-8 -right-8 h-24 w-24 ${stat.bgGlow} to-transparent opacity-50 blur-2xl`}
          />

          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs tracking-wider text-zinc-500 uppercase">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-white">
                {stat.value}
              </span>
              <span className="text-sm text-zinc-500">{stat.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
