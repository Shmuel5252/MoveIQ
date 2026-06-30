import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sectorMeta, rawSectorsForId } from "@/lib/sectorMeta";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sectorParam = req.nextUrl.searchParams.get("sector");

  try {
    const db = await getDb();
    const col = db.collection("sectorMapping");

    if (!sectorParam) {
      // Overview: all sectors with stock counts
      const grouped = await col
        .aggregate([{ $group: { _id: "$sector", count: { $sum: 1 } } }])
        .toArray();

      // Merge counts for raw sector names that map to the same id
      // (e.g. "Financials" / "Financial Services")
      const merged = new Map<string, { id: string; label: string; count: number }>();
      for (const g of grouped) {
        const meta = sectorMeta(g._id as string);
        const existing = merged.get(meta.id);
        if (existing) {
          existing.count += g.count as number;
        } else {
          merged.set(meta.id, { id: meta.id, label: meta.label, count: g.count as number });
        }
      }

      return NextResponse.json(Array.from(merged.values()));
    }

    // Specific sector: find the raw Yahoo sector name(s) that map to this id
    const rawSectors = rawSectorsForId(sectorParam);
    const query = rawSectors.length > 0 ? { sector: { $in: rawSectors } } : { sector: sectorParam };

    const stocks = await col
      .find(query)
      .project({ _id: 0, symbol: 1, companyName: 1, industry: 1 })
      .sort({ symbol: 1 })
      .toArray();

    return NextResponse.json({ stocks });
  } catch (err) {
    console.error("[sectors] error:", err);
    return NextResponse.json({ error: "Failed to load sector data" }, { status: 500 });
  }
}
