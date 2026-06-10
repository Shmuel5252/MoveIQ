import { NextRequest, NextResponse } from "next/server";
import { fetchChartData } from "@/lib/fetchChartData";

const VALID_INTERVALS = new Set(["5m", "15m", "1h", "1d", "1wk"]);
const VALID_RANGES = new Set(["1d", "5d", "1mo", "1y"]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const interval = searchParams.get("interval") ?? "5m";
  const range = searchParams.get("range") ?? "1d";

  if (!symbol || !/^[A-Z0-9.^-]{1,10}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }
  if (!VALID_INTERVALS.has(interval) || !VALID_RANGES.has(range)) {
    return NextResponse.json({ error: "Invalid interval or range" }, { status: 400 });
  }

  try {
    const data = await fetchChartData(symbol, interval, range);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
