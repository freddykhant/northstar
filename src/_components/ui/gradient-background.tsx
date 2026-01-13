/**
 * Background - Reusable gradient background component
 */

export function GradientBackground() {
  return (
    <>
      {/* Light mode gradients */}
      <div className="pointer-events-none absolute inset-0 block dark:hidden">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute right-1/4 top-20 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[100px]" />
        <div className="absolute left-1/3 bottom-0 h-[400px] w-[400px] rounded-full bg-red-400/8 blur-[100px]" />
      </div>

      {/* Dark mode gradients */}
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.4) 0%, transparent 60%)
          `,
        }}
      />

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
