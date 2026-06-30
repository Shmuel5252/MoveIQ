"use client";

import { useState } from "react";
import { Search, TrendingUp, Lightbulb, AlertTriangle } from "lucide-react";

interface SectorAnalysisResult {
  sectorTrend: string;
  leadingMovers: Array<{ symbol: string; reason: string }>;
  opportunityFactors: string[];
  riskFactors: string[];
}

interface Props {
  sectorId: string;
  sectorLabel: string;
}

export default function SectorAnalysisCard({ sectorId, sectorLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SectorAnalysisResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sector-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectorId, sectorLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ניתוח הסקטור נכשל");
      setAnalysis(data.analysis as SectorAnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ניתוח הסקטור נכשל");
    } finally {
      setLoading(false);
    }
  }

  if (!analysis) {
    return (
      <div dir="rtl" className="space-y-2">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-60 font-semibold text-sm transition-colors"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              מנתח סקטור...
            </>
          ) : (
            <>
              <Search size={16} strokeWidth={2} />
              נתח סקטור
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="bg-gray-900 rounded-2xl p-5 space-y-4">
      {/* Trend summary */}
      <div className="flex items-start gap-2.5">
        <TrendingUp size={17} strokeWidth={1.75} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-gray-100 leading-relaxed">{analysis.sectorTrend}</p>
      </div>

      {/* Leading movers */}
      {analysis.leadingMovers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-wide">מניות מובילות</p>
          <ul className="space-y-1.5">
            {analysis.leadingMovers.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="font-mono font-bold text-gray-200 shrink-0">{m.symbol}</span>
                <span className="text-gray-400">{m.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunities + risks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
        {analysis.opportunityFactors.length > 0 && (
          <div className="rounded-xl bg-[#13261f] border border-[#2d5a45]/60 p-3 space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-green-400/90">
              <Lightbulb size={13} strokeWidth={1.75} />
              הזדמנויות
            </p>
            <ul className="space-y-1">
              {analysis.opportunityFactors.map((f, i) => (
                <li key={i} className="text-xs text-gray-300 leading-snug">
                  • {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.riskFactors.length > 0 && (
          <div className="rounded-xl bg-[#241515] border border-[#5a3030]/60 p-3 space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-400/90">
              <AlertTriangle size={13} strokeWidth={1.75} />
              סיכונים
            </p>
            <ul className="space-y-1">
              {analysis.riskFactors.map((f, i) => (
                <li key={i} className="text-xs text-gray-300 leading-snug">
                  • {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
