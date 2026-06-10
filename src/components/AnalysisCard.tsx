import { AnalysisResult } from "@/lib/types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  analysis: AnalysisResult;
}

export default function AnalysisCard({ analysis }: Props) {
  return (
    <div dir="rtl" className="bg-gray-900 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-200">ניתוח AI</h2>
        <ConfidenceBadge
          confidence={analysis.confidence}
          level={analysis.confidenceLevel}
        />
      </div>

      <p className="text-white text-xl sm:text-2xl font-medium leading-snug">
        {analysis.mainReason}
      </p>

      {analysis.factors.length > 0 && (
        <div className="space-y-3 pt-1">
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            גורמים מרכזיים
          </p>
          <ul className="space-y-2.5">
            {analysis.factors.map((factor, i) => (
              <li key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{factor.name}</span>
                  <span className="text-gray-400 tabular-nums">{factor.impact}%</span>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
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
