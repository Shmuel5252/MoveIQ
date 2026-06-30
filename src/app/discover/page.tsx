"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Landmark,
  HeartPulse,
  ShoppingBag,
  Radio,
  ShoppingCart,
  Fuel,
  Factory,
  Building2,
  FlaskConical,
  Zap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import SectorAnalysisCard from "@/components/SectorAnalysisCard";

const SECTOR_ICONS: Record<string, LucideIcon> = {
  technology: Cpu,
  financial: Landmark,
  healthcare: HeartPulse,
  "consumer-cyclical": ShoppingBag,
  communication: Radio,
  "consumer-defensive": ShoppingCart,
  energy: Fuel,
  industrials: Factory,
  "real-estate": Building2,
  materials: FlaskConical,
  utilities: Zap,
};

interface SectorOverview {
  id: string;
  label: string;
  count: number;
}

interface SectorStock {
  symbol: string;
  companyName: string;
  industry: string;
}

const PAGE_SIZE = 20;

function SectorGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  const [sectors, setSectors] = useState<SectorOverview[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stocks, setStocks] = useState<SectorStock[] | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then((data: SectorOverview[]) => setSectors(data))
      .catch(() => setSectors([]));
  }, []);

  function selectSector(id: string) {
    setSelectedId(id);
    setStocks(null);
    setVisibleCount(PAGE_SIZE);
    setLoadingStocks(true);
    fetch(`/api/sectors?sector=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data: { stocks: SectorStock[] }) => setStocks(data.stocks ?? []))
      .catch(() => setStocks([]))
      .finally(() => setLoadingStocks(false));
  }

  const selectedMeta = sectors?.find((s) => s.id === selectedId) ?? null;

  return (
    <div dir="rtl" className="min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              גלה לפי סקטור
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              עיון בכל מניות ה-S&P 500 מחולק לפי תחומי פעילות
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mt-1"
          >
            ← חזור לחיפוש
          </Link>
        </div>

        {!selectedId ? (
          sectors === null ? (
            <SectorGridSkeleton />
          ) : sectors.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              נתוני סקטורים אינם זמינים כרגע. נסה שוב מאוחר יותר.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sectors.map((sector) => {
                const Icon = SECTOR_ICONS[sector.id];
                return (
                  <button
                    key={sector.id}
                    onClick={() => selectSector(sector.id)}
                    className="flex flex-col items-center gap-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl py-6 px-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  >
                    {Icon && <Icon size={26} strokeWidth={1.75} className="text-blue-400" />}
                    <span className="text-sm font-medium text-gray-200 text-center">
                      {sector.label}
                    </span>
                    <span className="text-xs text-gray-500">{sector.count} מניות</span>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowRight size={15} strokeWidth={2} />
              חזרה לסקטורים
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              {selectedMeta && SECTOR_ICONS[selectedMeta.id] && (
                (() => {
                  const Icon = SECTOR_ICONS[selectedMeta.id];
                  return <Icon size={22} strokeWidth={1.75} className="text-blue-400" />;
                })()
              )}
              <h2 className="text-xl font-bold text-white">
                {selectedMeta?.label}
                {selectedMeta && (
                  <span className="text-sm font-normal text-gray-400 mr-2">
                    ({selectedMeta.count} מניות)
                  </span>
                )}
              </h2>
            </div>

            {selectedId && (
              <SectorAnalysisCard sectorId={selectedId} sectorLabel={selectedMeta?.label ?? ""} />
            )}

            {loadingStocks ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(stocks ?? []).slice(0, visibleCount).map((stock) => (
                    <Link
                      key={stock.symbol}
                      href={`/stock/${stock.symbol}`}
                      className="flex flex-col gap-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20"
                    >
                      <span className="font-mono font-bold text-sm text-white tracking-wider">
                        {stock.symbol}
                      </span>
                      <span className="text-xs text-gray-500 truncate">{stock.companyName}</span>
                    </Link>
                  ))}
                </div>

                {stocks && visibleCount < stocks.length && (
                  <button
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    הצג עוד ({stocks.length - visibleCount} נוספות)
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
