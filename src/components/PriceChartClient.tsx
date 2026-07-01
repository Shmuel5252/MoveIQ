"use client";

import dynamic from "next/dynamic";

const PriceChart = dynamic(() => import("./PriceChart"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
      <div className="h-[200px] rounded-lg bg-gray-800 animate-pulse" />
    </div>
  ),
});

export default function PriceChartClient({
  symbol,
  changePercent,
}: {
  symbol: string;
  changePercent: number;
}) {
  return <PriceChart symbol={symbol} changePercent={changePercent} />;
}
