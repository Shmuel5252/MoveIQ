"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  bullCase: string[];
  bearCase: string[];
}

export default function BullBearCard({ bullCase, bearCase }: Props) {
  if (!bullCase.length && !bearCase.length) return null;

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-3">
      {/* Bear — right column in RTL */}
      <div className="rounded-xl p-4 bg-[#241515] border border-[#5a3030]/60 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-red-400/90">
          <TrendingDown size={15} strokeWidth={2} />
          <span>דובי</span>
        </h3>
        <ul className="space-y-2">
          {bearCase.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300 leading-snug">
              <span className="text-red-400/80 shrink-0 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bull — left column in RTL */}
      <div className="rounded-xl p-4 bg-[#13261f] border border-[#2d5a45]/60 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-green-400/90">
          <TrendingUp size={15} strokeWidth={2} />
          <span>שורי</span>
        </h3>
        <ul className="space-y-2">
          {bullCase.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300 leading-snug">
              <span className="text-green-400/80 shrink-0 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
