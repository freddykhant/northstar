/**
 * ProgressBar - Reusable progress bar with gradient
 */

interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-sm font-semibold text-black dark:text-white">{percentage}%</div>
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
      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        {completedCount} of {totalCount} {label}
      </div>
    </>
  );
}
