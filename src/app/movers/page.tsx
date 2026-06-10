import Link from "next/link";
import YahooFinance from "yahoo-finance2";
import fetchNews from "@/lib/fetchNews";
import analyzeMove from "@/lib/analyzeMove";
import MoversTabView from "@/components/MoversTabView";
import { type MoverData } from "@/components/MoverCard";
import { type StockData } from "@/lib/types";

export const revalidate = 600;

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeQuote(quote: any): Promise<MoverData> {
  const symbol: string = quote.symbol;
  const name: string = quote.shortName ?? quote.longName ?? symbol;
  const price: number = quote.regularMarketPrice ?? 0;
  const changePercent: number = quote.regularMarketChangePercent ?? 0;

  const stockData: StockData = {
    symbol,
    companyName: name,
    price,
    change: quote.regularMarketChange ?? 0,
    changePercent,
    volume: quote.regularMarketVolume ?? 0,
    avgVolume: quote.averageDailyVolume3Month ?? 0,
    marketCap: quote.marketCap,
  };

  try {
    const news = await fetchNews(symbol);
    if (news.length === 0) {
      return { symbol, name, price, changePercent, mainReason: "" };
    }
    const analysis = await analyzeMove(stockData, news);
    return { symbol, name, price, changePercent, mainReason: analysis.mainReason };
  } catch {
    return { symbol, name, price, changePercent, mainReason: "" };
  }
}

export default async function MoversPage() {
  const [gainersResult, losersResult] = await Promise.allSettled([
    yf.screener({ scrIds: "day_gainers", count: 10 }),
    yf.screener({ scrIds: "day_losers", count: 10 }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gainerQuotes: any[] =
    gainersResult.status === "fulfilled" ? gainersResult.value.quotes : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loserQuotes: any[] =
    losersResult.status === "fulfilled" ? losersResult.value.quotes : [];

  const [gainers, losers] = await Promise.all([
    Promise.allSettled(gainerQuotes.map(analyzeQuote)).then((results) =>
      results
        .filter((r): r is PromiseFulfilledResult<MoverData> => r.status === "fulfilled")
        .map((r) => r.value)
    ),
    Promise.allSettled(loserQuotes.map(analyzeQuote)).then((results) =>
      results
        .filter((r): r is PromiseFulfilledResult<MoverData> => r.status === "fulfilled")
        .map((r) => r.value)
    ),
  ]);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              📈 Market Movers
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              המניות עם השינוי החד ביותר לפי תקופה
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors mt-1"
          >
            ← חזור לחיפוש
          </Link>
        </div>

        <MoversTabView dayGainers={gainers} dayLosers={losers} />
      </div>
    </div>
  );
}
