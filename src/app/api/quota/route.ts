import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection("usage").findOne({ _id: "quota-tracker" as unknown as import("mongodb").ObjectId });
    const today = new Date().toISOString().slice(0, 10);
    const count = doc?.date === today ? (doc.count ?? 0) : 0;
    return NextResponse.json({ count, date: today, limit: 1500 });
  } catch (err) {
    console.error("[quota] error:", err);
    return NextResponse.json({ count: 0, date: "", limit: 1500 });
  }
}
