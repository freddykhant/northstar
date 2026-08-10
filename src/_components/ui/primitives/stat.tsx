interface StatProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export function Stat({ value, label, accent = false }: StatProps) {
  return (
    <div>
      <div
        className={`tabular text-[30px] leading-none font-extrabold tracking-[-0.04em] ${
          accent ? "text-[var(--color-mind-ink)]" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink-muted)] uppercase">
        {label}
      </div>
    </div>
  );
}
