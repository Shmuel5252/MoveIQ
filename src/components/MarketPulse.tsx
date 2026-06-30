"use client";

import { useEffect, useState } from "react";

interface PulseItem {
  name: string;
  price: number;
  changePercent: number;
}

export default function MarketPulse() {
  const [items, setItems] = useState<PulseItem[]>([]);

  useEffect(() => {
    fetch("/api/market-pulse")
      .then((r) => r.json())
      .then((data) => { console.log("market pulse data:", data); setItems(data); })
      .catch((err) => { console.log("market pulse error:", err); });
  }, []);

  if (!items.length) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      {items.map((item, i) => {
        const positive = item.changePercent >= 0;
        const sign = positive ? "+" : "";
        const color = positive ? "text-emerald-500" : "text-red-500";
        return (
          <>
            {i > 0 && (
              <span key={`dot-${i}`} className="text-gray-400 text-xs select-none"> · </span>
            )}
            <span
              key={item.name}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/5 border border-white/10 text-xs"
            >
              <span className="text-gray-400">{item.name}</span>
              <span className={`font-semibold tabular-nums ${color}`}>
                {sign}{item.changePercent.toFixed(1)}%
              </span>
            </span>
          </>
        );
      })}
    </div>
  );
}
