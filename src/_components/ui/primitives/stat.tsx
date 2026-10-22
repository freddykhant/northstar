interface StatProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export function Stat({ value, label, accent = false }: StatProps) {
  return (
    <div>
      <div
        className={`tabular text-stat ${
          accent ? "text-[var(--color-mind-ink)]" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </div>
      <div className="text-eyebrow mt-1 text-[var(--color-ink-muted)] uppercase">
        {label}
      </div>
    </div>
  );
}
