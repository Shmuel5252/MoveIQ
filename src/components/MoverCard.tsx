"use client";

import Link from "next/link";
import CompanyLogo from "./CompanyLogo";
import { getDomainFromCompanyName } from "@/lib/getDomain";

export interface MoverData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  mainReason: string;
}

interface Props {
  mover: MoverData;
  type: "gainer" | "loser";
}

export default function MoverCard({ mover, type }: Props) {
  const isGainer = type === "gainer";
  const changeColor = isGainer ? "text-emerald-400" : "text-red-400";
  const accentColor = isGainer ? "#10b981" : "#ef4444";
  const sign = isGainer ? "+" : "";
  const domain = getDomainFromCompanyName(mover.name);

  return (
    <Link
      href={`/stock/${mover.symbol}`}
      className="flex items-start gap-4 bg-gray-900 rounded-2xl p-4 hover:bg-gray-800/80 transition-colors border border-gray-800"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <CompanyLogo symbol={mover.symbol} domain={domain} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-white font-bold text-base font-mono tracking-wider">
            {mover.symbol}
          </span>
          <span className="text-gray-500 text-xs truncate">{mover.name}</span>
        </div>
        {mover.mainReason && (
          <p className="text-gray-400 text-sm leading-snug line-clamp-2">
            {mover.mainReason}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-white font-semibold text-sm">${mover.price.toFixed(2)}</p>
        <p className={`${changeColor} font-bold text-sm`}>
          {sign}{mover.changePercent.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}
