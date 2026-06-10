interface Props {
  confidence: number;
  level: "high" | "medium" | "low";
}

const styles = {
  high: "bg-green-900 text-green-300 border-green-700",
  medium: "bg-yellow-900 text-yellow-300 border-yellow-700",
  low: "bg-red-900 text-red-300 border-red-700",
};

const labels = {
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
};

export default function ConfidenceBadge({ confidence, level }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${styles[level]}`}
    >
      <span>{confidence}%</span>
      <span>&middot;</span>
      <span>{labels[level]}</span>
    </span>
  );
}
