interface Props {
  score: number;
}

export default function HeatScore({ score }: Props) {
  let color: string;
  let emoji: string;
  let label: string;

  if (score >= 80) {
    color = "text-red-400";
    emoji = "🔥";
    label = "פעילות חריגה";
  } else if (score >= 60) {
    color = "text-orange-400";
    emoji = "⚡";
    label = "פעילות גבוהה";
  } else if (score >= 40) {
    color = "text-yellow-400";
    emoji = "📊";
    label = "פעילות רגילה";
  } else {
    color = "text-gray-400";
    emoji = "💤";
    label = "פעילות נמוכה";
  }

  return (
    <div className="flex flex-col items-end shrink-0">
      <div className={`flex items-center gap-1 font-bold tabular-nums ${color}`}>
        <span className="text-base">{emoji}</span>
        <span className="text-lg">{score}</span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
