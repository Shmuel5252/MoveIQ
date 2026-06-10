"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TrendingItem } from "@/app/api/trending/route";

interface Props {
  onSearch: (symbol: string) => void;
}

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-11 rounded-xl bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}

export default function MiniMarketMovers({ onSearch }: Props) {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TrendingItem[]) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Hide entirely on empty (error or market closed)
  if (!loading && items.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto space-y-2">
      <p className="text-gray-400 text-sm pe-1">מגמות בולטות היום</p>

      {loading ? (
        <SkeletonRows />
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const isUp = item.changePercent >= 0;
            const changeColor = isUp ? "text-emerald-400" : "text-red-400";
            const sign = isUp ? "+" : "";

            return (
              <button
                key={item.symbol}
                onClick={() => onSearch(item.symbol)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors text-start"
              >
                {/* Right side in RTL: symbol + change % */}
                <div className="shrink-0 flex items-baseline gap-2">
                  <span className="font-bold text-white text-sm tracking-wide">
                    {item.symbol}
                  </span>
                  <span className={`${changeColor} font-bold text-base leading-none`}>
                    {sign}{item.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Left side in RTL: reason */}
                <p className="flex-1 text-gray-400 text-sm truncate text-start">
                  {item.mainReason || item.companyName}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <Link
        href="/movers"
        className="block w-full py-2.5 px-4 rounded-xl border border-gray-700 hover:border-gray-500 text-center text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        ← ראה את כל התנועות הבולטות בשוק
      </Link>
    </div>
  );
}
