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
    { label: "Current streak", value: currentStreak, unit: "days" },
    { label: "This week", value: weekPercentage, unit: "%" },
    { label: "Total completed", value: totalCompleted, unit: "habits" },
    { label: "Best streak", value: bestStreak, unit: "days" },
  ];

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-black/8 overflow-hidden rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] sm:grid-cols-4 sm:divide-y-0 dark:divide-white/8 dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)]">
      {stats.map((stat) => (
        <div key={stat.label} className="px-5 py-5">
          <div className="text-[10px] font-medium tracking-[0.14em] text-[var(--color-ink-muted)] uppercase dark:text-[var(--color-ink-dark-muted)]">
            {stat.label}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className="tabular font-serif text-[34px] leading-none font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]"
              style={{ fontOpticalSizing: "auto", letterSpacing: "-0.02em" }}
            >
              {stat.value}
            </span>
            <span className="text-[12px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
              {stat.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
