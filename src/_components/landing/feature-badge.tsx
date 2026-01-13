/**
 * FeatureBadge - Small feature tags like ReadMe's hero section
 */

interface FeatureBadgeProps {
  icon: string;
  label: string;
  color?: "blue" | "red" | "purple" | "zinc";
}

export function FeatureBadge({
  icon,
  label,
  color = "zinc",
}: FeatureBadgeProps) {
  const colorStyles = {
    blue: "text-blue-400",
    red: "text-red-400",
    purple: "text-purple-400",
    zinc: "text-zinc-400",
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
      <span className="text-lg">{icon}</span>
      <span className={`text-sm font-medium ${colorStyles[color]}`}>
        {label}
      </span>
    </div>
  );
}
