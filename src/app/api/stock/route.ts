import { NextRequest, NextResponse } from "next/server";
import fetchStockData from "@/lib/fetchStockData";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const stock = await fetchStockData(symbol);
    return NextResponse.json(stock);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "Symbol not found") {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
