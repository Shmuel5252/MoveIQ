"use client";

import { useEffect, useState } from "react";

interface QuotaData {
  count: number;
  limit: number;
  date: string;
}

function useQuota() {
  const [data, setData] = useState<QuotaData | null>(null);
  useEffect(() => {
    fetch("/api/quota")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);
  return data;
}

// Compact badge — original style (used as fallback / internal use)
export default function QuotaBadge() {
  const data = useQuota();
  if (!data) return null;

  const color =
    data.count >= 1300 ? "text-red-400" : data.count >= 1000 ? "text-yellow-400" : "text-green-400";

  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded bg-gray-800 ${color} select-none`}>
      AI {data.count}/{data.limit}
    </span>
  );
}

// Card variant — used in the new Header
export function QuotaCard() {
  const data = useQuota();
  if (!data) return <div className="w-28 h-9" />;

  const pct = Math.min((data.count / data.limit) * 100, 100);
  const barColor =
    data.count >= 1300 ? "#ef4444" : data.count >= 1000 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col gap-1 select-none min-w-[112px]">
      <span className="text-[10px] text-gray-400 font-medium leading-none">AI Credits</span>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <span className="text-[11px] font-mono leading-none" style={{ color: barColor }}>
        {data.count.toLocaleString()} / {data.limit.toLocaleString()}
      </span>
    </div>
  );
}