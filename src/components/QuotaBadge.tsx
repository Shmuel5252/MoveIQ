"use client";

import { useEffect, useState } from "react";

interface QuotaData {
  count: number;
  limit: number;
  date: string;
}

export default function QuotaBadge() {
  const [data, setData] = useState<QuotaData | null>(null);

  useEffect(() => {
    fetch("/api/quota")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const color =
    data.count >= 1300
      ? "text-red-400"
      : data.count >= 1000
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded bg-gray-800 ${color} select-none`}>
      AI {data.count}/{data.limit}
    </span>
  );
}
