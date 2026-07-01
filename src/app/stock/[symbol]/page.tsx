import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Star, Share2, Sparkles } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import PriceChartClient from "@/components/PriceChartClient";
import HeroAnalysisCard from "@/components/HeroAnalysisCard";
import BullBearCard from "@/components/BullBearCard";
import RelatedStocksNav from "@/components/RelatedStocksNav";
import FollowUpChat from "@/components/FollowUpChat";
import NewsSection from "@/components/NewsSection";
import { StockPageData } from "@/lib/types";
import { calculateHeatScore } from "@/lib/calculateHeatScore";
import { calculateAIScore } from "@/lib/calculateAIScore";

interface PageProps {
  params: { symbol: string };
}

async function getStockData(symbol: string): Promise<StockPageData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
      next: { revalidate: 300 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Analysis failed");
    return res.json() as Promise<StockPageData>;
  } catch {
    return null;
  }
}

function marketCapLabel(cap?: number): string | null {
  if (!cap) return null;
  if (cap >= 200e9) return "Mega Cap";
  if (cap >= 10e9) return "Large Cap";
  if (cap >= 2e9) return "Mid Cap";
  return "Small Cap";
}

// Circular AI Score — pure SVG, no library
function AIScoreCircle({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1f2937" strokeWidth="5" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="36" y="33" textAnchor="middle" fill="white" fontSize="15" fontWeight="800">
          {score}
        </text>
        <text x="36" y="47" textAnchor="middle" fill="#6b7280" fontSize="8">
          AI Score
        </text>
      </svg>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  const data = await getStockData(symbol);
  return {
    title: `${symbol} — ניתוח AI | MoveIQ`,
    description: data?.analysis.mainReason ?? `ניתוח AI של מניית ${symbol}.`,
  };
}

export default async function StockPage({ params }: PageProps) {
  const symbol = params.symbol.toUpperCase();
  const data = await getStockData(symbol);
  if (!data) notFound();

  const { stock, analysis, news } = data;
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
  const changeSign  = isPositive ? "+" : "";
  const arrow       = isPositive ? "▲" : "▼";
  const capLabel    = marketCapLabel(stock.marketCap);
  const aiScore     = stock.aiScore ?? calculateAIScore(stock, news.length, analysis.confidence);
  const heatScore   = calculateHeatScore(stock, news.length, analysis.confidence);

  return (
    <div dir="rtl" className="min-h-screen text-gray-100 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ── Stage 1: Hero ── */}

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors text-gray-300"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors text-gray-400 hover:text-yellow-400">
              <Star size={17} strokeWidth={1.75} />
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors text-gray-400 hover:text-blue-400">
              <Share2 size={17} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-4">
          <CompanyLogo symbol={stock.symbol} domain={stock.website} size="lg" />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
              {stock.symbol}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{stock.companyName}</p>
            <div className="flex gap-2 mt-2">
              {stock.exchange && (
                <span className="text-[11px] font-semibold bg-white/[0.07] border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                  {stock.exchange}
                </span>
              )}
              {capLabel && (
                <span className="text-[11px] font-semibold bg-white/[0.07] border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                  {capLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-[56px] font-extrabold text-white leading-none tabular-nums">
            ${stock.price.toFixed(2)}
          </p>
          <p className={`text-lg font-semibold mt-1 tabular-nums ${changeColor}`}>
            {arrow} {changeSign}{stock.change.toFixed(2)}&nbsp;
            ({changeSign}{stock.changePercent.toFixed(2)}%)
          </p>
        </div>

        {/* ── Stage 4: Stats grid ── */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "פתיחה",          value: stock.price ? `$${(stock.price - stock.change).toFixed(2)}` : "—" },
              { label: "גבוה יומי",       value: stock.fiftyTwoWeekHigh ? `$${stock.fiftyTwoWeekHigh.toFixed(2)}` : "—" },
              { label: "נמוך יומי",       value: stock.fiftyTwoWeekLow  ? `$${stock.fiftyTwoWeekLow.toFixed(2)}`  : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] my-3" />
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "שווי שוק",        value: stock.marketCap ? `$${(stock.marketCap / 1e9).toFixed(1)}B` : "—" },
              { label: "מכפיל רווח (P/E)", value: stock.peRatio   ? stock.peRatio.toFixed(2)                    : "—" },
              { label: "תשואת דיבידנד",   value: stock.dividendYield && stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stage 3: Chart ── */}
        <PriceChartClient symbol={symbol} changePercent={stock.changePercent} />

        {/* ── Stage 2: AI Score Card ── */}
        <div className="bg-gradient-to-br from-[#111827] to-[#0d1f3f] border border-blue-900/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-bold text-white mb-1">
              <Sparkles size={14} strokeWidth={2} className="text-blue-400" />
              ניתוח AI
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              הנתונים מבוססים על נתוני שוק, חדשות אחרונות ומודלים מתקדמים
            </p>
          </div>
          <AIScoreCircle score={aiScore} />
        </div>

        {/* ── Stage 5: CTA button (already analyzed — show "קרא ניתוח מלא") ── */}
        <p className="text-xs text-gray-500 text-center -mt-1">
          הניתוח נטען אוטומטית עבור עמוד זה
        </p>

        {/* ── Stage 6: HeroAnalysisCard ── */}
        <HeroAnalysisCard
          analysis={analysis}
          changePercent={stock.changePercent}
          symbol={stock.symbol}
          companyName={stock.companyName}
          heatScore={heatScore}
        />

        <BullBearCard bullCase={analysis.bullCase} bearCase={analysis.bearCase} />

        <RelatedStocksNav symbols={analysis.relatedSymbols} />

        <FollowUpChat
          symbol={stock.symbol}
          companyName={stock.companyName}
          context={`${analysis.oneLiner}\n\n${analysis.detailedExplanation}`}
          dynamicQuestions={analysis.suggestedQuestions}
        />

        {analysis.enrichedNews.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              חדשות אחרונות
            </h2>
            <NewsSection news={analysis.enrichedNews} />
          </section>
        )}

      </div>
    </div>
  );
}
