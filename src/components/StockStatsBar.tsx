"use client";

import { useState } from "react";
import { StockData } from "@/lib/types";

interface Props {
  stock: StockData;
}

function formatMarketCap(v?: number): string {
  if (v == null) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function formatVolume(v?: number): string {
  if (v == null) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toLocaleString();
}

function formatPE(v?: number): string {
  return v != null ? `${v.toFixed(1)}x` : "—";
}

function formatDividend(v?: number): string {
  if (v == null || v === 0) return "—";
  // yahoo-finance2 may return a fraction (0.024) or a percentage (2.4)
  return v < 0.5 ? `${(v * 100).toFixed(2)}%` : `${v.toFixed(2)}%`;
}

function formatPrice(v?: number): string {
  return v != null ? `$${v.toFixed(2)}` : "—";
}

function formatBeta(v?: number): string {
  return v != null ? v.toFixed(2) : "—";
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-white tabular-nums">{value}</p>
    </div>
  );
}

export default function StockStatsBar({ stock }: Props) {
  const [expanded, setExpanded] = useState(false);

  const primaryStats = [
    { label: "מכפיל רווח (P/E)", value: formatPE(stock.peRatio) },
    { label: "שווי שוק",          value: formatMarketCap(stock.marketCap) },
    { label: "תשואת דיבידנד",     value: formatDividend(stock.dividendYield) },
    { label: "שיא 52 שבועות",     value: formatPrice(stock.fiftyTwoWeekHigh) },
  ];

  const secondaryStats = [
    { label: "מכפיל עתידי (F/E)", value: formatPE(stock.forwardPE) },
    { label: "תחתית 52 שבועות",  value: formatPrice(stock.fiftyTwoWeekLow) },
    { label: "מחזור ממוצע",       value: formatVolume(stock.avgVolume) },
    { label: "בטא",               value: formatBeta(stock.beta) },
  ];

  return (
    <div dir="rtl" className="bg-gray-900 rounded-xl px-4 py-3 space-y-3">
      {/* Primary stats — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryStats.map((s) => (
          <StatCell key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      {/* Secondary stats — slide in when expanded */}
      {expanded && (
        <div
          key="secondary"
          className="animate-in slide-in-from-top-2 grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-800"
        >
          {secondaryStats.map((s) => (
            <StatCell key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <span>עוד נתונים</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
