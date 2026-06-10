
import YahooFinance from "yahoo-finance2";
import { StockData } from "./types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export default async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    // Run quote and quoteSummary in parallel; summary failure is non-fatal
    const [quoteResult, summaryResult] = await Promise.allSettled([
      yf.quote(symbol),
      yf.quoteSummary(symbol, { modules: ["financialData"] }),
    ]);

    if (quoteResult.status === "rejected" || !quoteResult.value?.regularMarketPrice) {
      throw new Error("Symbol not found");
    }

    const quote = quoteResult.value;
    const fin =
      summaryResult.status === "fulfilled"
        ? summaryResult.value?.financialData
        : undefined;

    return {
      symbol: quote.symbol,
      companyName: quote.shortName ?? symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      avgVolume: quote.averageDailyVolume10Day ?? 0,
      marketCap: quote.marketCap,
      peRatio: quote.trailingPE,
      dividendYield: quote.dividendYield,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      forwardPE: quote.forwardPE,
      beta: quote.beta,
      eps: quote.epsTrailingTwelveMonths,
      revenue: fin?.totalRevenue ?? undefined,
      // profitMargins is a decimal fraction (0.25 = 25%)
      profitMargin: fin?.profitMargins ?? undefined,
      // debtToEquity from yahoo is expressed as a % (e.g. 156 = 1.56x D/E)
      debtToEquity: fin?.debtToEquity ?? undefined,
    };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Symbol not found") throw err;
      if (
        err.message.includes("No fundamentals data") ||
        err.message.includes("Not found")
      ) {
        throw new Error("Symbol not found");
      }
    }
    throw new Error("Failed to fetch stock data");
  }
}
