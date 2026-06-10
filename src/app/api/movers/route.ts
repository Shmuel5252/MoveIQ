import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { topStocks } from "@/lib/topStocks";
import { type MoverData } from "@/components/MoverCard";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const VALID_PERIODS = new Set(["week", "month", "3months", "year"]);

function getPeriodStart(period: string): Date {
  const d = new Date();
  switch (period) {
    case "week":    d.setDate(d.getDate() - 7);         break;
    case "month":   d.setMonth(d.getMonth() - 1);       break;
    case "3months": d.setMonth(d.getMonth() - 3);       break;
    case "year":    d.setFullYear(d.getFullYear() - 1); break;
  }
  return d;
}

interface StockResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

async function fetchPeriodChange(
  symbol: string,
  name: string,
  period1: Date,
  period2: Date,
): Promise<StockResult | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await yf.chart(symbol, { period1, period2, interval: "1d" as any });
    const quotes = result.quotes.filter((q) => q.close != null);
    if (quotes.length < 2) return null;
    const first = quotes[0].close!;
    const last = quotes[quotes.length - 1].close!;
    return {
      symbol,
      name,
      price: last,
      changePercent: ((last - first) / first) * 100,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "week";

  if (!VALID_PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const period1 = getPeriodStart(period);
  const period2 = new Date();

  // Fetch all 150 stocks with concurrency capped at 15
  const results: (StockResult | null)[] = new Array(topStocks.length).fill(null);
  let nextIdx = 0;

  async function worker() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const idx = nextIdx++;            // atomic in single-threaded JS
      if (idx >= topStocks.length) break;
      const { symbol, name } = topStocks[idx];
      results[idx] = await fetchPeriodChange(symbol, name, period1, period2);
    }
  }

  await Promise.all(Array.from({ length: 15 }, worker));

  const valid = results
    .filter((r): r is StockResult => r !== null)
    .sort((a, b) => b.changePercent - a.changePercent);

  const toMover = (r: StockResult): MoverData => ({
    symbol: r.symbol,
    name: r.name,
    price: r.price,
    changePercent: r.changePercent,
    mainReason: "",
  });

  const gainers = valid.slice(0, 10).map(toMover);
  const losers = [...valid].reverse().slice(0, 10).map(toMover);

  return NextResponse.json(
    { gainers, losers },
    { headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=3600" } },
  );
}
