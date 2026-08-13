"use client";

interface SegmentedControlProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--color-sunken)] p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-[8px] px-3 py-1 text-[12px] font-semibold ${
            value === o.id
              ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-card)]"
              : "text-[var(--color-ink-muted)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
