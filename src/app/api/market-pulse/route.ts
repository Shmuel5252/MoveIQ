import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

export const revalidate = 300;

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const SYMBOLS = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "^VIX",  name: "VIX" },
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      SYMBOLS.map(({ symbol }) => yf.quote(symbol))
    );

    const data = results.map((r, i) => {
      if (r.status === "fulfilled") {
        return {
          name: SYMBOLS[i].name,
          price: r.value.regularMarketPrice ?? 0,
          changePercent: r.value.regularMarketChangePercent ?? 0,
        };
      }
      return { name: SYMBOLS[i].name, price: 0, changePercent: 0 };
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
