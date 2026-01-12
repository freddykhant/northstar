/**
 * GlassCard - Reusable glassmorphism card component
 */

import type { PropsWithChildren } from "react";

interface GlassCardProps extends PropsWithChildren {
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

interface GlassCardHeaderProps extends PropsWithChildren {
  className?: string;
}

export function GlassCardHeader({ 
  children, 
  className = "" 
}: GlassCardHeaderProps) {
  return (
    <div className={`border-b border-zinc-800 p-6 ${className}`}>
      {children}
    </div>
  );
}

interface GlassCardBodyProps extends PropsWithChildren {
  className?: string;
}

export function GlassCardBody({ 
  children, 
  className = "" 
}: GlassCardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
