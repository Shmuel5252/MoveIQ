"use client";

import Link from "next/link";
import { Star } from "lucide-react";

export interface MoverData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  mainReason: string;
  aiScore?: number;
}

interface Props {
  mover: MoverData;
  type: "gainer" | "loser";
}

const SPARKLINE_UP = [
  "2,18 10,15 18,16 26,11 34,13 42,8  50,9  58,4",
  "2,20 10,17 18,18 26,13 34,15 42,10 50,7  58,3",
  "2,19 10,16 18,14 26,12 34,10 42,11 50,6  58,5",
];
const SPARKLINE_DOWN = [
  "2,4  10,7  18,6  26,11 34,9  42,14 50,16 58,20",
  "2,3  10,8  18,7  26,12 34,14 42,16 50,18 58,21",
  "2,5  10,6  18,9  26,10 34,13 42,15 50,17 58,19",
];

function MiniSparkline({ isUp, symbol }: { isUp: boolean; symbol: string }) {
  const idx = symbol.charCodeAt(0) % 3;
  const points = isUp ? SPARKLINE_UP[idx] : SPARKLINE_DOWN[idx];
  const stroke = isUp ? "#10b981" : "#ef4444";
  return (
    <svg width="52" height="22" viewBox="0 0 60 24" fill="none" className="opacity-80 shrink-0">
      <polyline points={points} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function MoverCard({ mover, type }: Props) {
  const isGainer = type === "gainer";
  const changeColor = isGainer ? "text-emerald-400" : "text-red-400";
  const priceChangeColor = isGainer ? "text-emerald-400" : "text-red-400";
  const accentColor = isGainer ? "#10b981" : "#ef4444";
  const sign = isGainer ? "+" : "";
  const dollarChange = (mover.price * (mover.changePercent / 100)).toFixed(2);

  return (
    <Link
      href={`/stock/${mover.symbol}`}
      className="flex items-center gap-3 bg-[#111827] hover:bg-[#1a2235] transition-all duration-200 border border-white/[0.06] rounded-2xl px-4 py-3.5 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5"
      style={{ borderLeft: `3px solid ${accentColor}` }}
      dir="ltr"
    >
      {/* Left: % change + sparkline */}
      <div className="flex flex-col gap-1 shrink-0 w-[74px]">
        <span className={`text-base font-extrabold tabular-nums leading-none ${changeColor}`}>
          {sign}{mover.changePercent.toFixed(2)}%
        </span>
        <MiniSparkline isUp={isGainer} symbol={mover.symbol} />
      </div>

      {/* Center: symbol + company */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm font-mono tracking-wide leading-tight">
          {mover.symbol}
        </p>
        <p className="text-gray-500 text-xs truncate leading-tight mt-0.5">{mover.name}</p>
      </div>

      {/* Right: price + dollar change + star */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-sm font-bold text-white tabular-nums">${mover.price.toFixed(2)}</span>
        <span className={`text-xs font-semibold tabular-nums ${priceChangeColor}`}>
          {sign}${Math.abs(parseFloat(dollarChange)).toFixed(2)}
        </span>
        <Star size={12} strokeWidth={1.5} className="text-gray-600 mt-0.5" />
      </div>
    </Link>
  );
}
