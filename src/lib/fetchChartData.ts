import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface ChartPoint {
  time: number; // Unix timestamp in seconds (UTCTimestamp for lightweight-charts)
  open: number;
  high: number;
  low: number;
  close: number;
}

function rangeToDateRange(range: string): { period1: Date; period2: Date } {
  const now = new Date();
  const from = new Date(now);
  switch (range) {
    case "1d":  from.setDate(from.getDate() - 1);        break;
    case "5d":  from.setDate(from.getDate() - 7);        break;
    case "1mo": from.setMonth(from.getMonth() - 1);      break;
    case "1y":  from.setFullYear(from.getFullYear() - 1); break;
    default:    from.setDate(from.getDate() - 1);
  }
  return { period1: from, period2: now };
}

export async function fetchChartData(
  symbol: string,
  interval: string,
  range: string,
): Promise<ChartPoint[]> {
  const { period1, period2 } = rangeToDateRange(range);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await yf.chart(symbol, { interval: interval as any, period1, period2 });

  return result.quotes
    .filter((q) => q.close != null && q.open != null && q.high != null && q.low != null)
    .map((q) => ({
      time: Math.floor(q.date.getTime() / 1000),
      open: Number(q.open!.toFixed(2)),
      high: Number(q.high!.toFixed(2)),
      low: Number(q.low!.toFixed(2)),
      close: Number(q.close!.toFixed(2)),
    }))
    .sort((a, b) => a.time - b.time); // lightweight-charts requires ascending order
}
