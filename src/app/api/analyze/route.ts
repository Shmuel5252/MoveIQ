import { NextRequest, NextResponse } from "next/server";
import fetchStockData from "@/lib/fetchStockData";
import fetchNews from "@/lib/fetchNews";
import analyzeMove from "@/lib/analyzeMove";
import { StockPageData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symbol: string = body?.symbol?.trim().toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const stock = await fetchStockData(symbol);
    const news = await fetchNews(symbol);
    const analysis = await analyzeMove(stock, news);

    const data: StockPageData = { stock, news, analysis };
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "Symbol not found") {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
