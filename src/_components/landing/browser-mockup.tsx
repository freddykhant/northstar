/**
 * BrowserMockup - Makes components look like they're in a real browser
 */

interface BrowserMockupProps {
  children: React.ReactNode;
  title?: string;
}

export function BrowserMockup({ children, title = "Northstar" }: BrowserMockupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900/80 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-3 flex-1 rounded bg-zinc-800/50 px-3 py-1">
          <span className="text-xs text-zinc-500">{title}</span>
        </div>
      </div>
      {/* Content */}
      <div className="bg-[#0a0a0a]">{children}</div>
    </div>
  );
}
