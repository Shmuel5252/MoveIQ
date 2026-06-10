import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import fetchNews from "@/lib/fetchNews";
import analyzeMove from "@/lib/analyzeMove";
import { type StockData } from "@/lib/types";

export const dynamic = "force-dynamic";
// export const revalidate = 600;

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface TrendingItem {
  symbol: string;
  companyName: string;
  changePercent: number;
  mainReason: string;
}

export async function GET() {
  try {
    const result = await yf.screener({ scrIds: "day_gainers", count: 3 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes: any[] = result.quotes ?? [];

    const items = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quotes.map(async (quote: any): Promise<TrendingItem> => {
        const symbol: string = quote.symbol;
        const companyName: string = quote.shortName ?? quote.longName ?? symbol;
        const changePercent: number = quote.regularMarketChangePercent ?? 0;

        const stockData: StockData = {
          symbol,
          companyName,
          price: quote.regularMarketPrice ?? 0,
          change: quote.regularMarketChange ?? 0,
          changePercent,
          volume: quote.regularMarketVolume ?? 0,
          avgVolume: quote.averageDailyVolume3Month ?? 0,
          marketCap: quote.marketCap,
        };

        try {
          const news = await fetchNews(symbol);
          if (news.length === 0) return { symbol, companyName, changePercent, mainReason: "" };
          const analysis = await analyzeMove(stockData, news);
          return { symbol, companyName, changePercent, mainReason: analysis.mainReason };
        } catch {
          return { symbol, companyName, changePercent, mainReason: "" };
        }
      }),
    );

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
