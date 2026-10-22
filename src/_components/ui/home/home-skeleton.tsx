export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      <div className="h-16 w-2/3 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
      <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
      <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
      <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-sunken)]" />
    </div>
  );
}
