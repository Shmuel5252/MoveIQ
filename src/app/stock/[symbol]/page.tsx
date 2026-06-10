import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import StockHeader from "@/components/StockHeader";
import PriceChart from "@/components/PriceChart";
import AnalysisCard from "@/components/AnalysisCard";
import NewsSection from "@/components/NewsSection";
import { StockPageData } from "@/lib/types";

interface PageProps {
  params: { symbol: string };
}

async function getStockData(symbol: string): Promise<StockPageData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
      next: { revalidate: 300 },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Analysis failed");

    return res.json() as Promise<StockPageData>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  const data = await getStockData(symbol);

  return {
    title: `למה ${symbol} זזה היום? | למה המניה זזה?`,
    description: data?.analysis.mainReason ?? `ניתוח AI של תנועת מניית ${symbol} היום.`,
  };
}

export default async function StockPage({ params }: PageProps) {
  const symbol = params.symbol.toUpperCase();
  const data = await getStockData(symbol);

  if (!data) notFound();

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            למה המניה זזה?
          </h1>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            &larr; חיפוש מניה אחרת
          </Link>
        </div>

        <StockHeader stock={data.stock} language="he" />
        <PriceChart symbol={symbol} changePercent={data.stock.changePercent} />
        <AnalysisCard analysis={data.analysis} />

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">
            חדשות אחרונות
          </h2>
          <NewsSection news={data.analysis.enrichedNews} />
        </section>
      </div>
    </div>
  );
}
