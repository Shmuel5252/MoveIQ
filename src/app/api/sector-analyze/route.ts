import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import analyzeSector, { type SectorStockMove } from "@/lib/analyzeSector";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import { rawSectorsForId } from "@/lib/sectorMeta";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const QUOTA_ID = "quota-tracker";
const QUOTA_LIMIT = 1400;
const MAX_STOCKS = 20;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sectorId: string = body?.sectorId;
    const sectorLabel: string = body?.sectorLabel ?? sectorId;

    if (!sectorId) {
      return NextResponse.json({ error: "sectorId is required" }, { status: 400 });
    }

    await ensureIndexes();
    const db = await getDb();
    const cacheCol = db.collection("sectorAnalysisCache");
    const usageCol = db.collection("usage");
    const sectorCol = db.collection("sectorMapping");

    // ── Cache lookup (2h TTL) ───────────────────────────────────────────────
    const cached = await cacheCol.findOne({ sectorId });
    if (cached) {
      return NextResponse.json({ analysis: cached.analysis, fromCache: true });
    }

    // ── Quota check + increment (shared tracker with /api/analyze) ─────────
    const today = new Date().toISOString().slice(0, 10);
    const quotaFilter = { _id: QUOTA_ID } as unknown as { _id: import("mongodb").ObjectId };

    await usageCol.updateOne(
      quotaFilter,
      { $setOnInsert: { date: today, count: 0 } },
      { upsert: true }
    );
    await usageCol.updateOne(
      { ...quotaFilter, date: { $ne: today } },
      { $set: { date: today, count: 0 } }
    );

    const quota = await usageCol.findOne(quotaFilter);
    if ((quota?.count ?? 0) >= QUOTA_LIMIT) {
      return NextResponse.json(
        { error: "מכסת ה-AI היומית מתקרבת לסיום, נסה שוב מחר" },
        { status: 429 }
      );
    }
    await usageCol.updateOne(quotaFilter, { $inc: { count: 1 } });

    // ── Pull a capped sample of the sector's stocks, fetch live % change ───
    const rawSectors = rawSectorsForId(sectorId);
    const query = rawSectors.length > 0 ? { sector: { $in: rawSectors } } : { sector: sectorId };

    const sectorStocks = await sectorCol
      .find(query)
      .project({ _id: 0, symbol: 1, companyName: 1 })
      .limit(MAX_STOCKS)
      .toArray();

    if (sectorStocks.length === 0) {
      return NextResponse.json({ error: "No stocks found for this sector" }, { status: 404 });
    }

    const symbols = sectorStocks.map((s) => s.symbol as string);
    const quotes = await yf.quote(symbols);

    const stockMoves: SectorStockMove[] = sectorStocks.map((s) => {
      const q = quotes.find((qq) => qq.symbol === s.symbol);
      return {
        symbol: s.symbol as string,
        companyName: s.companyName as string,
        changePercent: (q as { regularMarketChangePercent?: number })?.regularMarketChangePercent ?? 0,
      };
    });

    // ── Analyze + cache ──────────────────────────────────────────────────────
    const analysis = await analyzeSector(sectorLabel, stockMoves);
    if (!analysis) {
      return NextResponse.json({ error: "Sector analysis failed" }, { status: 500 });
    }

    await cacheCol.updateOne(
      { sectorId },
      { $set: { sectorId, analysis, createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ analysis, fromCache: false });
  } catch (err) {
    console.error("[sector-analyze] error:", err);
    return NextResponse.json({ error: "Sector analysis failed" }, { status: 500 });
  }
}
