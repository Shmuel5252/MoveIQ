import { NextRequest, NextResponse } from "next/server";
import fetchStockData from "@/lib/fetchStockData";
import fetchNews from "@/lib/fetchNews";
import analyzeMove from "@/lib/analyzeMove";
import { StockPageData } from "@/lib/types";
import { getDb, ensureIndexes } from "@/lib/mongodb";

const QUOTA_ID = "quota-tracker";
const QUOTA_LIMIT = 1400;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symbol: string = body?.symbol?.trim().toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await ensureIndexes();
    const db = await getDb();
    const cacheCol = db.collection("analysisCache");
    const usageCol = db.collection("usage");

    // ── Task 1: cache lookup ──────────────────────────────────────────────────
    const cached = await cacheCol.findOne({ symbol });
    if (cached) {
      const stock = await fetchStockData(symbol);
      const data = { stock, news: [], analysis: cached.analysis, fromCache: true };
      return NextResponse.json(data);
    }

    // ── Task 2: quota check + increment ──────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const quotaFilter = { _id: QUOTA_ID } as unknown as { _id: import("mongodb").ObjectId };

    // Ensure the tracker document exists (no-op if already present)
    await usageCol.updateOne(
      quotaFilter,
      { $setOnInsert: { date: today, count: 0 } },
      { upsert: true }
    );

    // Reset counter if it's a new day (doc is guaranteed to exist now)
    await usageCol.updateOne(
      { ...quotaFilter, date: { $ne: today } },
      { $set: { date: today, count: 0 } }
    );

    const quota = await usageCol.findOne(quotaFilter);
    const currentCount = quota?.count ?? 0;

    if (currentCount >= QUOTA_LIMIT) {
      return NextResponse.json(
        { error: "מכסת ה-AI היומית מתקרבת לסיום, נסה שוב מחר" },
        { status: 429 }
      );
    }

    // Increment before calling Gemini (counts the attempt)
    await usageCol.updateOne(quotaFilter, { $inc: { count: 1 } });

    // ── Fetch + analyze ───────────────────────────────────────────────────────
    const stock = await fetchStockData(symbol);
    const news = await fetchNews(symbol);
    const analysis = await analyzeMove(stock, news);

    // ── Save to cache ─────────────────────────────────────────────────────────
    await cacheCol.updateOne(
      { symbol },
      { $set: { symbol, analysis, createdAt: new Date() } },
      { upsert: true }
    );

    const data: StockPageData & { fromCache: boolean } = {
      stock, news, analysis, fromCache: false,
    };
    return NextResponse.json(data);

  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "Symbol not found") {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }
    console.error("[analyze] error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
