"use client";

import { useEffect, useState } from "react";

interface PulseItem {
  name: string;
  price: number;
  changePercent: number;
}

// Decorative sparkline paths per slot (positive / negative variants).
// Deterministic so server + client render the same markup.
const SPARKLINE_POINTS = {
  up: [
    "5,22 14,19 24,17 34,19 44,13 54,10 64,12 75,6",
    "5,23 14,20 24,22 34,16 44,18 54,12 64,9  75,5",
    "5,24 14,21 24,18 34,20 44,14 54,11 64,13 75,7",
  ],
  down: [
    "5,7  14,10 24,8  34,13 44,11 54,16 64,18 75,23",
    "5,6  14,9  24,11 34,14 44,16 54,18 64,20 75,24",
    "5,8  14,11 24,9  34,15 44,13 54,17 64,19 75,22",
  ],
};

function Sparkline({ positive, idx }: { positive: boolean; idx: number }) {
  const points = positive
    ? SPARKLINE_POINTS.up[idx % 3]
    : SPARKLINE_POINTS.down[idx % 3];
  const stroke = positive ? "#10b981" : "#ef4444";

  return (
    <svg
      width="64"
      height="28"
      viewBox="0 0 80 30"
      fill="none"
      className="shrink-0 opacity-80"
    >
      <polyline
        points={points}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Skeleton card while loading
function SkeletonCard() {
  return (
    <div className="flex-1 min-w-0 bg-[#111827] border border-white/[0.06] rounded-2xl px-4 py-3 animate-pulse">
      <div className="h-3 w-12 bg-gray-800 rounded mb-2" />
      <div className="h-5 w-16 bg-gray-800 rounded" />
    </div>
  );
}

export default function MarketPulse() {
  const [items, setItems] = useState<PulseItem[]>([]);

  useEffect(() => {
    fetch("/api/market-pulse")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  if (!items.length) {
    return (
      <div className="flex gap-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {items.map((item, i) => {
        const positive = item.changePercent >= 0;
        const sign = positive ? "+" : "";
        const valueColor = positive ? "text-emerald-400" : "text-red-400";
        const arrow = positive ? "▲" : "▼";

        return (
          <div
            key={item.name}
            className="flex-1 min-w-0 bg-[#111827] border border-white/[0.06] rounded-2xl px-4 py-3 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium leading-none mb-1.5 truncate">
                {item.name}
              </p>
              <p className={`text-base font-bold tabular-nums leading-none ${valueColor}`}>
                <span className="text-[13px] mr-0.5">{arrow}</span>
                {sign}{Math.abs(item.changePercent).toFixed(1)}%
              </p>
            </div>
            <Sparkline positive={positive} idx={i} />
          </div>
        );
      })}
    </div>
  );
}
