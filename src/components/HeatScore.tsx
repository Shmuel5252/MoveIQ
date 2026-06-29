import { Zap, BarChart3, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  score: number;
}

export default function HeatScore({ score }: Props) {
  let color: string;
  let label: string;
  // Extreme tier keeps the 🔥 emoji intentionally — a deliberate, attention-grabbing
  // exception to the monochrome-icon rule for the single "this is unusually hot" state.
  let Icon: LucideIcon | null = null;
  let fireEmoji = false;

  if (score >= 80) {
    color = "text-red-400";
    label = "פעילות חריגה";
    fireEmoji = true;
  } else if (score >= 60) {
    color = "text-orange-400";
    label = "פעילות גבוהה";
    Icon = Zap;
  } else if (score >= 40) {
    color = "text-yellow-400";
    label = "פעילות רגילה";
    Icon = BarChart3;
  } else {
    color = "text-gray-400";
    label = "פעילות נמוכה";
    Icon = Moon;
  }

  return (
    <div className="flex flex-col items-end shrink-0">
      <div className={`flex items-center gap-1 font-bold tabular-nums ${color}`}>
        {fireEmoji ? (
          <span className="text-base">🔥</span>
        ) : (
          Icon && <Icon size={15} strokeWidth={2} />
        )}
        <span className="text-lg">{score}</span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
