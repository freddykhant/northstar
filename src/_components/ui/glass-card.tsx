import type { PropsWithChildren } from "react";

interface SurfaceCardProps extends PropsWithChildren {
  className?: string;
}

export function GlassCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-[12px] border border-black/8 bg-[var(--color-paper-raised)] dark:border-white/8 dark:bg-[var(--color-paper-dark-raised)] ${className}`}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  children,
  className = "",
}: SurfaceCardProps) {
  return (
    <div
      className={`border-b border-black/8 px-6 py-4 dark:border-white/8 ${className}`}
    >
      {children}
    </div>
  );
}

export function GlassCardBody({ children, className = "" }: SurfaceCardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
