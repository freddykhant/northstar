interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="h-[3px] overflow-hidden rounded-full bg-black/8 dark:bg-white/8">
          <div
            className="h-full rounded-full bg-[var(--color-ember)] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="tabular text-[12px] font-medium text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
        {percentage}%
      </div>
    </div>
  );
}

interface ProgressBarWithLabelProps {
  percentage: number;
  completedCount: number;
  totalCount: number;
  label?: string;
}

export function ProgressBarWithLabel({
  percentage,
  completedCount,
  totalCount,
  label = "completed",
}: ProgressBarWithLabelProps) {
  return (
    <>
      <ProgressBar percentage={percentage} />
      <div className="tabular mt-2 text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-dark-muted)]">
        {completedCount} of {totalCount} {label}
      </div>
    </>
  );
}
