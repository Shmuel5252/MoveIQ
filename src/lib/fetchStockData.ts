
import YahooFinance from "yahoo-finance2";
import { StockData } from "./types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export default async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    const quote = await yf.quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      throw new Error("Symbol not found");
    }

    return {
      symbol: quote.symbol,
      companyName: quote.shortName ?? symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      avgVolume: quote.averageDailyVolume10Day ?? 0,
      marketCap: quote.marketCap,
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
