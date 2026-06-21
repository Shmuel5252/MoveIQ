"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import MiniMarketMovers from "@/components/MiniMarketMovers";
import StockCard from "@/components/StockCard";
import HeroAnalysisCard from "@/components/HeroAnalysisCard";
import FollowUpChat from "@/components/FollowUpChat";
import PriceChart from "@/components/PriceChart";
import NewsSection from "@/components/NewsSection";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import MarketPulse from "@/components/MarketPulse";
import { calculateHeatScore } from "@/lib/calculateHeatScore";
import Timeline from "@/components/Timeline";
import BullBearCard from "@/components/BullBearCard";
import RelatedStocks from "@/components/RelatedStocks";
import { buildTimeline, TimelineEvent, ChartPoint } from "@/lib/buildTimeline";
import { StockData, StockPageData } from "@/lib/types";

const LOADING_MESSAGES = [
  "מושך נתוני מניה...",
  "מנתח חדשות...",
  "מתרגם ומסכם...",
  "כמעט מוכן...",
];

export default function HomePage() {
  // Step 1: stock data only
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  // Step 2: full analysis
  const [result, setResult] = useState<StockPageData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const [error, setError] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"chart" | "timeline" | "news">("chart");

  // Rotate loading messages during analysis
  useEffect(() => {
    if (!loadingAnalysis) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 2000);
    return () => clearInterval(timer);
  }, [loadingAnalysis]);

  // Fetch timeline chart data after analysis completes
  useEffect(() => {
    if (!result) { setTimelineEvents([]); return; }
    setActiveTab("chart");
    fetch(`/api/chart?symbol=${result.stock.symbol}&interval=15m&range=1d`)
      .then((r) => r.json())
      .then((chartData: ChartPoint[]) => {
        setTimelineEvents(buildTimeline(result.stock, result.analysis.enrichedNews, chartData));
      })
      .catch(() => setTimelineEvents([]));
  }, [result]);

  // Step 1: fetch stock data only
  async function handleSearch(symbol: string) {
    setLoadingStock(true);
    setError(null);
    setStockData(null);
    setResult(null);

    try {
      const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "לא נמצאה מניה");

      setStockData(data as StockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת נתוני המניה");
    } finally {
      setLoadingStock(false);
    }
  }

  // Step 2: run AI analysis
  async function handleAnalyze() {
    if (!stockData) return;
    setLoadingAnalysis(true);
    setLoadingMsg(LOADING_MESSAGES[0]);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: stockData.symbol, language: "he" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ניתוח נכשל");

      setResult(data as StockPageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ניתוח נכשל");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  const showHome = !stockData && !loadingStock;

  return (
    <div dir="rtl" className="flex-1 flex flex-col justify-center bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ── Hero / Search ── */}
        <div className={`space-y-3 ${showHome ? "py-4 sm:py-8" : ""}`}>
          <div className="text-center space-y-1">
            {showHome && (
              <div className="flex justify-center mb-1">
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 text-slate-600 px-3 py-1 rounded-full text-xs font-medium mb-3 shadow-sm">
                  ⚡ ניתוח AI בזמן אמת
                </span>
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
              למה המניה זזה?
            </h1>
            {showHome && (
              <p className="text-gray-500 text-base sm:text-lg">
                הכנס סימול מניה וקבל ניתוח AI של התנועה
              </p>
            )}
          </div>

          {showHome && <MarketPulse />}

          <SearchBar onSearch={handleSearch} loading={loadingStock || loadingAnalysis} />

          {showHome && <MiniMarketMovers onSearch={handleSearch} />}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Step 1 loading ── */}
        {loadingStock && (
          <div className="space-y-5">
            <p className="text-center text-gray-500 text-base font-medium animate-pulse">
              מושך נתוני מניה...
            </p>
            <LoadingSkeleton />
          </div>
        )}

        {/* ── Step 1 result: StockCard + Analyze button ── */}
        {stockData && !loadingStock && (
          <div className="space-y-3">
            <StockCard stock={stockData} />

            {/* Analyze button — only show before analysis is done */}
            {!result && !loadingAnalysis && (
              <button
                onClick={handleAnalyze}
                className="w-full py-3.5 rounded-2xl bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 font-semibold text-base transition-colors"
              >
                נתח מניה 🔍
              </button>
            )}

            {/* ── Step 2 loading ── */}
            {loadingAnalysis && (
              <div className="space-y-4 py-2">
                <p className="text-center text-gray-500 text-base font-medium animate-pulse">
                  {loadingMsg}
                </p>
                <LoadingSkeleton />
              </div>
            )}

            {/* ── Step 2 result: full analysis ── */}
            {result && !loadingAnalysis && (
              <div className="space-y-3">
                {/* Hero insight card */}
                <HeroAnalysisCard
                  analysis={result.analysis}
                  changePercent={result.stock.changePercent}
                  symbol={result.stock.symbol}
                  companyName={result.stock.companyName}
                  heatScore={calculateHeatScore(result.stock, result.news.length, result.analysis.confidence)}
                />

                {/* Bull vs Bear */}
                <BullBearCard
                  bullCase={result.analysis.bullCase}
                  bearCase={result.analysis.bearCase}
                />

                {/* Related stocks */}
                <RelatedStocks
                  symbols={result.analysis.relatedSymbols}
                  onSearch={handleSearch}
                />

                {/* Follow-up chat */}
                <FollowUpChat
                  symbol={result.stock.symbol}
                  companyName={result.stock.companyName}
                  context={`${result.analysis.oneLiner}\n\n${result.analysis.detailedExplanation}`}
                  dynamicQuestions={result.analysis.suggestedQuestions}
                />

                {/* Tabs */}
                <div className="space-y-3">
                  <div className="flex border-b border-gray-700" dir="rtl">
                    {(
                      [
                        { id: "chart", label: "גרף מניה" },
                        { id: "timeline", label: "ציר זמן" },
                        { id: "news", label: "חדשות אחרונות" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 px-1 ml-5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                          activeTab === tab.id
                            ? "text-blue-500 border-blue-500"
                            : "text-gray-400 border-transparent hover:text-gray-500"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div key={activeTab} className="animate-fade-in">
                    {activeTab === "chart" && (
                      <PriceChart
                        symbol={result.stock.symbol}
                        changePercent={result.stock.changePercent}
                      />
                    )}
                    {activeTab === "timeline" && (
                      timelineEvents.length >= 3 ? (
                        <div className="bg-[#131722] rounded-2xl px-5 py-4">
                          <Timeline events={timelineEvents} />
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-10">
                          אין מספיק נתוני ציר זמן להצגה
                        </p>
                      )
                    )}
                    {activeTab === "news" && (
                      <NewsSection news={result.analysis.enrichedNews} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
