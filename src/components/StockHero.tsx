"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
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

function fmt(v: number | undefined | null, fn: (n: number) => string): string {
  return v != null ? fn(v) : "—";
}
function fmtPrice(v?: number) { return fmt(v, n => `$${n.toFixed(2)}`); }
function fmtPE(v?: number)    { return fmt(v, n => `${n.toFixed(1)}x`); }
function fmtCap(v?: number): string {
  return fmt(v, n =>
    n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` :
    n >= 1e9  ? `$${(n / 1e9).toFixed(1)}B`  :
    n >= 1e6  ? `$${(n / 1e6).toFixed(1)}M`  : `$${n.toLocaleString()}`
  );
}
function fmtVol(v?: number): string {
  return fmt(v, n =>
    n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` :
    n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` :
    n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n.toLocaleString()
  );
}
function fmtDividend(v?: number): string {
  if (v == null || v === 0) return "—";
  return v < 0.5 ? `${(v * 100).toFixed(2)}%` : `${v.toFixed(2)}%`;
}
function fmtMargin(v?: number) { return fmt(v, n => `${(n * 100).toFixed(1)}%`); }
function fmtDE(v?: number)     { return fmt(v, n => `${(n / 100).toFixed(2)}x`); }
function fmtBeta(v?: number)   { return fmt(v, n => n.toFixed(2)); }
function fmtEPS(v?: number)    { return fmt(v, n => `$${n.toFixed(2)}`); }

function marketCapLabel(cap?: number): string | null {
  if (!cap) return null;
  if (cap >= 200e9) return "Mega Cap";
  if (cap >= 10e9)  return "Large Cap";
  if (cap >= 2e9)   return "Mid Cap";
  return "Small Cap";
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-white tabular-nums">{value}</p>
    </div>
  );
}

export default function StockHero({ stock, newsCount = 0, confidence = 0 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isPositive   = stock.change >= 0;
  const changeColor  = isPositive ? "text-emerald-400" : "text-red-400";
  const changeSign   = isPositive ? "+" : "";
  const arrow        = isPositive ? "▲" : "▼";
  const accentColor  = isPositive ? "#10b981" : "#ef4444";
  const heatScore    = calculateHeatScore(stock, newsCount, confidence);
  const rsiSignal    = calculateRSISignal(stock.changePercent, stock.volume, stock.avgVolume);
  const capLabel     = marketCapLabel(stock.marketCap);

  const primaryStats = [
    { label: "שווי שוק",       value: fmtCap(stock.marketCap) },
    { label: "מכפיל רווח P/E", value: fmtPE(stock.peRatio) },
    { label: "שיא 52 שבועות",  value: fmtPrice(stock.fiftyTwoWeekHigh) },
    { label: "תשואת דיבידנד",  value: fmtDividend(stock.dividendYield) },
    { label: "מחזור מסחר",     value: fmtVol(stock.volume) },
    { label: "תחתית 52 שבועות",value: fmtPrice(stock.fiftyTwoWeekLow) },
  ];

  const secondaryStats = [
    { label: "מכפיל עתידי F/E", value: fmtPE(stock.forwardPE) },
    { label: "בטא",              value: fmtBeta(stock.beta) },
    { label: "רווח למניה EPS",  value: fmtEPS(stock.eps) },
    { label: "הכנסות",           value: fmtCap(stock.revenue) },
    { label: "מרווח רווח",       value: fmtMargin(stock.profitMargin) },
    { label: "יחס חוב D/E",     value: fmtDE(stock.debtToEquity) },
  ];

  return (
    <div
      className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      {/* ── Identity row ── */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-4">
        <CompanyLogo symbol={stock.symbol} domain={stock.website} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none">
              {stock.symbol}
            </h2>
            <span className="text-gray-400 text-sm truncate">{stock.companyName}</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {stock.exchange && (
              <span className="text-[11px] font-semibold bg-white/[0.06] border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                {stock.exchange}
              </span>
            )}
            {capLabel && (
              <span className="text-[11px] font-semibold bg-white/[0.06] border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                {capLabel}
              </span>
            )}
          </div>
        </div>
        <HeatScore score={heatScore} />
      </div>

      {/* ── Price ── */}
      <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
        <p className="text-[48px] font-extrabold text-white leading-none tabular-nums">
          ${stock.price.toFixed(2)}
        </p>
        <p className={`text-base font-semibold mt-1 tabular-nums flex items-center gap-1.5 ${changeColor}`}>
          {isPositive ? <TrendingUp size={16} strokeWidth={2} /> : <TrendingDown size={16} strokeWidth={2} />}
          {arrow} {changeSign}{stock.change.toFixed(2)}&nbsp;
          ({changeSign}{stock.changePercent.toFixed(2)}%)
        </p>
      </div>

      {/* ── Primary stats 3×2 grid ── */}
      <div className="border-t border-white/[0.06] px-5 py-4 grid grid-cols-3 gap-4">
        {primaryStats.map(s => <StatCell key={s.label} label={s.label} value={s.value} />)}
      </div>

      {/* ── Expand toggle ── */}
      <div className="flex justify-center pb-3">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors px-3 py-1"
        >
          <span>עוד נתונים</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Secondary stats ── */}
      {expanded && (
        <div className="animate-in slide-in-from-top-2 border-t border-white/[0.06] px-5 pt-4 pb-4 grid grid-cols-3 gap-4">
          {secondaryStats.map(s => <StatCell key={s.label} label={s.label} value={s.value} />)}
        </div>
      )}

      {/* ── Technical indicator pills (expanded) ── */}
      {expanded && (stock.shortFloat != null || rsiSignal !== "neutral") && (
        <div className="animate-in slide-in-from-top-2 border-t border-white/[0.06] px-5 pt-3 pb-4 flex flex-wrap gap-2">
          {stock.shortFloat != null && stock.shortFloat > 0 && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
              stock.shortFloat * 100 > 10
                ? "bg-red-950/40 border-red-800/40 text-red-400"
                : "bg-gray-800 border-gray-700 text-gray-400"
            }`}>
              שורט: {(stock.shortFloat * 100).toFixed(1)}%
            </span>
          )}
          {rsiSignal === "overbought" && (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-red-950/40 border border-red-800/40 text-red-400">
              קניית יתר 🔴
            </span>
          )}
          {rsiSignal === "oversold" && (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-green-950/40 border border-green-800/40 text-emerald-400">
              מכירת יתר 🟢
            </span>
          )}
        </div>
      )}
    </div>
  );
}
