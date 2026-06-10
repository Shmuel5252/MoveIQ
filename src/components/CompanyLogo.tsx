"use client";

import { useState } from "react";

interface Props {
  symbol: string;
  domain?: string;
  size?: "sm" | "md";
}

export default function CompanyLogo({ symbol, domain, size = "md" }: Props) {
  const [failed, setFailed] = useState(false);

  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";

  if (!domain || failed) {
    return (
      <div
        className={`${dim} rounded-full bg-gray-700 flex items-center justify-center shrink-0`}
      >
        <span className="font-bold text-white">{symbol[0]}</span>
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-full overflow-hidden flex items-center justify-center bg-gray-800 shrink-0`}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt={symbol}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
