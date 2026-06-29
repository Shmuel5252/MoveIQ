import { NextRequest, NextResponse } from "next/server";
import fetchCompanyProfile from "@/lib/fetchCompanyProfile";
import analyzeCompany from "@/lib/analyzeCompany";
import { getDb, ensureIndexes } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    await ensureIndexes();
    const db = await getDb();
    const cacheCol = db.collection("companyProfileCache");

    const cached = await cacheCol.findOne({ symbol });
    if (cached) {
      return NextResponse.json({ available: true, profile: cached.profile, fromCache: true });
    }

    const raw = await fetchCompanyProfile(symbol);
    if (!raw) {
      return NextResponse.json({ available: false });
    }

    const profile = await analyzeCompany(raw);
    if (!profile) {
      return NextResponse.json({ available: false });
    }

    await cacheCol.updateOne(
      { symbol },
      { $set: { symbol, profile, createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ available: true, profile, fromCache: false });
  } catch (err) {
    console.error("[company-profile] error:", err);
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
