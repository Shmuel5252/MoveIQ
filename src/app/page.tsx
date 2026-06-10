"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import MiniMarketMovers from "@/components/MiniMarketMovers";
import StockHeader from "@/components/StockHeader";
import PriceChart from "@/components/PriceChart";
import AnalysisCard from "@/components/AnalysisCard";
import NewsSection from "@/components/NewsSection";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { StockPageData } from "@/lib/types";

const LOADING_MESSAGES = [
  "מושך נתוני מניה...",
  "מנתח חדשות...",
  "מתרגם ומסכם...",
  "כמעט מוכן...",
];

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StockPageData | null>(null);

  useEffect(() => {
    if (!loading) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 2000);
    return () => clearInterval(timer);
  }, [loading]);

  async function handleSearch(symbol: string) {
    setLoading(true);
    setLoadingMsg(LOADING_MESSAGES[0]);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, language: "he" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "ניתוח נכשל");
      }

      setResult(data as StockPageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ניתוח נכשל");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="flex-1 flex flex-col justify-center bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Hero / Search */}
        <div className={`space-y-3 ${result || loading ? "" : "py-4 sm:py-8"}`}>
          <div className="text-center space-y-1">
            {!result && !loading && (
              <div className="flex justify-center mb-1">
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 text-slate-600 px-3 py-1 rounded-full text-xs font-medium mb-3 shadow-sm">
                  ⚡ ניתוח AI בזמן אמת
                </span>
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
              למה המניה זזה?
            </h1>
            {!result && !loading && (
              <p className="text-gray-500 text-base sm:text-lg">
                הכנס סימול מניה וקבל ניתוח AI של התנועה
              </p>
            )}
          </div>
          <SearchBar onSearch={handleSearch} loading={loading} />

          {!result && !loading && (
            <MiniMarketMovers onSearch={handleSearch} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            <p className="text-center text-gray-500 text-base font-medium animate-pulse">
              {loadingMsg}
            </p>
            <LoadingSkeleton />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5">
            <StockHeader stock={result.stock} language="he" />
            <PriceChart symbol={result.stock.symbol} changePercent={result.stock.changePercent} />
            <AnalysisCard analysis={result.analysis} />

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">
                חדשות אחרונות
              </h2>
              <NewsSection news={result.analysis.enrichedNews} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
