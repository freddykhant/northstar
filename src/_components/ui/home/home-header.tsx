import { Card, Stat } from "../primitives";

interface HomeHeaderProps {
  name: string;
  streak: number;
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function HomeHeader({ name, streak }: HomeHeaderProps) {
  const today = new Date();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-eyebrow text-[var(--color-ink-muted)] uppercase">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 text-[28px] leading-[1.05] font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-display">
          Good {timeOfDay()}, {name}
        </h1>
      </div>

      <Card className="shrink-0 text-center">
        <Stat value={streak} label="day streak" accent />
      </Card>
    </div>
  );
}
