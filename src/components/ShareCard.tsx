"use client";

import { useState } from "react";

interface Props {
  symbol: string;
  changePercent: number;
  oneLiner: string;
  confidence: number;
  heatScore: number;
  compact?: boolean;
}

function buildShareText(
  symbol: string,
  changePercent: number,
  oneLiner: string,
  confidence: number,
  heatScore: number
): string {
  const sign = changePercent >= 0 ? "+" : "";
  return `📊 ${symbol} ${sign}${changePercent.toFixed(2)}% | MoveIQ

🎯 ${oneLiner}

🔥 Heat Score: ${heatScore}
💪 ביטחון: ${confidence}%

נותח על ידי MoveIQ → move-iq-one.vercel.app`;
}

export default function ShareCard({
  symbol,
  changePercent,
  oneLiner,
  confidence,
  heatScore,
  compact = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = buildShareText(symbol, changePercent, oneLiner, confidence, heatScore);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or API unavailable — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleShare}
        title="שתף ניתוח"
        className="text-gray-500 hover:text-white transition-colors p-1"
      >
        {copied ? "✅" : "📤"}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "border-green-700 bg-green-950/30 text-green-400"
          : "border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-white"
      }`}
    >
      {copied ? "✅ הועתק!" : "שתף ניתוח 📤"}
    </button>
  );
}
