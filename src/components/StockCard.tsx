"use client";

import { useState } from "react";
import { StockData } from "@/lib/types";
import CompanyLogo from "./CompanyLogo";
import HeatScore from "./HeatScore";
import { calculateHeatScore } from "@/lib/calculateHeatScore";
import { calculateRSISignal } from "@/lib/calculateRSISignal";

interface Props {
  stock: StockData;
  newsCount?: number;
  confidence?: number;
}

// ── Format helpers ────────────────────────────────────────────────────────────

function fmt(v: number | undefined | null, fn: (n: number) => string): string {
  return v != null ? fn(v) : "—";
}

function formatPrice(v?: number)     { return fmt(v, n => `$${n.toFixed(2)}`); }
function formatPE(v?: number)        { return fmt(v, n => `${n.toFixed(1)}x`); }
function formatBeta(v?: number)      { return fmt(v, n => n.toFixed(2)); }
function formatEPS(v?: number)       { return fmt(v, n => `$${n.toFixed(2)}`); }

function formatMarketCap(v?: number): string {
  return fmt(v, n => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  });
}

function formatVolume(v?: number): string {
  return fmt(v, n => {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return n.toLocaleString();
  });
}

function formatDividend(v?: number): string {
  if (v == null || v === 0) return "—";
  return v < 0.5 ? `${(v * 100).toFixed(2)}%` : `${v.toFixed(2)}%`;
}

function formatMargin(v?: number): string {
  return fmt(v, n => `${(n * 100).toFixed(1)}%`);
}

// D/E from yahoo is expressed as percentage (156 = 1.56x)
function formatDE(v?: number): string {
  return fmt(v, n => `${(n / 100).toFixed(2)}x`);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-white tabular-nums">{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StockCard({ stock, newsCount = 0, confidence = 0 }: Props) {
  const heatScore = calculateHeatScore(stock, newsCount, confidence);
  const rsiSignal = calculateRSISignal(stock.changePercent, stock.volume, stock.avgVolume);
  const [expanded, setExpanded] = useState(false);

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
  const changeSign  = isPositive ? "+" : "";

  const primaryStats = [
    { label: "מכפיל רווח P/E",  value: formatPE(stock.peRatio) },
    { label: "שווי שוק",         value: formatMarketCap(stock.marketCap) },
    { label: "תשואת דיבידנד",    value: formatDividend(stock.dividendYield) },
    { label: "שיא 52 שבועות",    value: formatPrice(stock.fiftyTwoWeekHigh) },
  ];

  const secondaryStats = [
    { label: "מכפיל עתידי F/E",  value: formatPE(stock.forwardPE) },
    { label: "תחתית 52 שבועות",  value: formatPrice(stock.fiftyTwoWeekLow) },
    { label: "מחזור ממוצע",       value: formatVolume(stock.avgVolume) },
    { label: "בטא",               value: formatBeta(stock.beta) },
    { label: "רווח למניה EPS",   value: formatEPS(stock.eps) },
    { label: "הכנסות",            value: formatMarketCap(stock.revenue) },
    { label: "מרווח רווח",        value: formatMargin(stock.profitMargin) },
    { label: "יחס חוב D/E",      value: formatDE(stock.debtToEquity) },
  ];

  return (
    <div dir="rtl" className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* ── Top: company info + price ── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        {/* Right: logo + name + symbol */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
          <CompanyLogo symbol={stock.symbol} domain={stock.website} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-400 truncate">{stock.companyName}</p>
            <p className="text-xs text-gray-500 font-mono tracking-widest mt-0.5">
              {stock.symbol}
            </p>
          </div>
        </div>

        {/* Left: price + change + heat score (always LTR) */}
        <div dir="ltr" className="flex items-start gap-4 shrink-0">
          <div className="text-left">
            <p className="text-3xl font-bold text-white tabular-nums leading-none">
              ${stock.price.toFixed(2)}
            </p>
            <p className={`text-sm font-medium tabular-nums mt-1 ${changeColor}`}>
              {changeSign}{stock.change.toFixed(2)}&nbsp;
              ({changeSign}{stock.changePercent.toFixed(2)}%)
            </p>
          </div>
          <HeatScore score={heatScore} />
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/10 mx-5" />

      {/* ── Primary stats grid ── */}
      <div className="px-5 pt-4 pb-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryStats.map(s => <StatCell key={s.label} label={s.label} value={s.value} />)}
      </div>

      {/* ── Expand toggle ── */}
      <div className="flex justify-center pb-3">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1"
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

      {/* ── Secondary stats grid (expanded) ── */}
      {expanded && (
        <div className="animate-in slide-in-from-top-2 border-t border-white/10 mx-5 pt-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryStats.map(s => <StatCell key={s.label} label={s.label} value={s.value} />)}
        </div>
      )}

      {/* ── Technical indicators row (expanded) ── */}
      {expanded && (
        <div className="animate-in slide-in-from-top-2 border-t border-white/10 mx-5 pt-3 pb-5 flex flex-wrap gap-2">
          {stock.shortFloat != null && stock.shortFloat > 0 && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${
              stock.shortFloat * 100 > 10
                ? "bg-red-950/40 border-red-800/40 text-red-400"
                : "bg-gray-800 border-gray-700 text-gray-400"
            }`}>
              שורט: {(stock.shortFloat * 100).toFixed(1)}%
            </span>
          )}

          {rsiSignal === "overbought" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-red-950/40 border border-red-800/40 text-red-400">
              קניית יתר
            </span>
          )}
          {rsiSignal === "oversold" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-950/40 border border-green-800/40 text-emerald-400">
              מכירת יתר
            </span>
          )}
        </div>
      )}
    </div>
  );
}
