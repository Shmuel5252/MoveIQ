import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

export const dynamic = "force-dynamic";

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

    const items: TrendingItem[] = quotes.map((quote) => ({
      symbol: quote.symbol,
      companyName: quote.shortName ?? quote.longName ?? quote.symbol,
      changePercent: quote.regularMarketChangePercent ?? 0,
      mainReason: "",
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
