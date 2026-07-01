export const dynamic = "force-dynamic";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import YahooFinance from "yahoo-finance2";
import MoversTabView from "@/components/MoversTabView";
import { type MoverData } from "@/components/MoverCard";
import { calculateAIScore } from "@/lib/calculateAIScore";
import type { StockData } from "@/lib/types";

export const revalidate = 600;

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function quoteToMover(quote: any): MoverData {
  const stockLike = {
    changePercent: quote.regularMarketChangePercent ?? 0,
    volume: quote.regularMarketVolume ?? 0,
    avgVolume: quote.averageDailyVolume3Month ?? 0,
    peRatio: quote.trailingPE ?? undefined,
    beta: quote.beta ?? undefined,
    dividendYield: quote.dividendYield ?? undefined,
  } as Partial<StockData>;

  return {
    symbol: quote.symbol,
    name: quote.shortName ?? quote.longName ?? quote.symbol,
    price: quote.regularMarketPrice ?? 0,
    changePercent: quote.regularMarketChangePercent ?? 0,
    mainReason: "",
    aiScore: calculateAIScore(stockLike as StockData, 0, 0),
  };
}

export default async function MoversPage() {
  const [gainersResult, losersResult] = await Promise.allSettled([
    yf.screener({ scrIds: "day_gainers", count: 10 }),
    yf.screener({ scrIds: "day_losers", count: 10 }),
  ]);

  const gainers: MoverData[] =
    gainersResult.status === "fulfilled" ? gainersResult.value.quotes.map(quoteToMover) : [];
  const losers: MoverData[] =
    losersResult.status === "fulfilled" ? losersResult.value.quotes.map(quoteToMover) : [];

  return (
    <div dir="rtl" className="min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* Hero */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="flex items-center gap-2.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              התנועות
              <TrendingUp size={26} strokeWidth={2.5} className="text-blue-400 shrink-0" />
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 leading-snug">
              מעקב אחר המניות בתנועה הגרוה ביותר בשוק
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mt-1"
          >
            ← חזור
          </Link>
        </div>

        <MoversTabView dayGainers={gainers} dayLosers={losers} />
      </div>
    </div>
  );
}
