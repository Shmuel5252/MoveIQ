import { AnalysisResult } from "@/lib/types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  analysis: AnalysisResult;
  changePercent: number;
}

export default function HeroAnalysisCard({ analysis, changePercent }: Props) {
  const accentBorder =
    changePercent >= 0 ? "border-r-4 border-r-green-500" : "border-r-4 border-r-red-500";

  return (
    <div
      dir="rtl"
      className={`rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-slate-800 via-slate-800 to-blue-950 border border-blue-900/30 ${accentBorder} space-y-4`}
    >
      {/* Headline */}
      <div>
        <p className="text-xs text-slate-400 mb-3">🎯 השורה התחתונה</p>
        <p className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-4">
          {analysis.oneLiner || analysis.mainReason}
        </p>
        <ConfidenceBadge confidence={analysis.confidence} level={analysis.confidenceLevel} />
      </div>

      {/* Factors */}
      {analysis.factors.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase tracking-wide pt-1">גורמים מרכזיים</p>
          <ul className="space-y-2.5">
            {analysis.factors.map((factor, i) => (
              <li key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{factor.name}</span>
                  <span className="text-slate-400 tabular-nums">{factor.impact}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(factor.impact, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
