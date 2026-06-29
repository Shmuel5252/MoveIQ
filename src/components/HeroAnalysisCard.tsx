"use client";

import { useState, useRef } from "react";
import { Share2, Target } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import ConfidenceBadge from "./ConfidenceBadge";
import ShareTemplate from "./ShareTemplate";

interface Props {
  analysis: AnalysisResult;
  changePercent: number;
  symbol: string;
  companyName: string;
  heatScore: number;
}

export default function HeroAnalysisCard({
  analysis,
  changePercent,
  symbol,
  companyName,
  heatScore,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const accentBorder =
    changePercent >= 0 ? "border-r-4 border-r-green-500" : "border-r-4 border-r-red-500";

  const hasDetails = !!analysis.detailedExplanation;

  async function handleShare() {
    if (!shareRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) => (node as HTMLElement).tagName !== "BUTTON",
      });
      const link = document.createElement("a");
      link.download = `MoveIQ-${symbol}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("[ShareCard] image generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      {/* Off-screen share template — captured by html-to-image */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <ShareTemplate
          ref={shareRef}
          symbol={symbol}
          companyName={companyName}
          oneLiner={analysis.oneLiner || analysis.mainReason}
          confidence={analysis.confidence}
          confidenceLevel={analysis.confidenceLevel}
          changePercent={changePercent}
          heatScore={heatScore}
        />
      </div>

      {/* Visible card */}
      <div
        dir="rtl"
        className={`relative rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-slate-800 via-slate-800 to-blue-950 border border-blue-900/30 ${accentBorder} space-y-4`}
      >
        {/* Share icon — absolute top-left (visual top-right in RTL) */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          title="שתף ניתוח"
          className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Share2 size={16} />
          )}
        </button>

        {/* Headline */}
        <div>
          <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 pr-10">
            <Target size={13} strokeWidth={1.75} />
            השורה התחתונה
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-4">
            {analysis.oneLiner || analysis.mainReason}
          </p>
          <ConfidenceBadge confidence={analysis.confidence} level={analysis.confidenceLevel} />
        </div>

        {/* Factors */}
        {analysis.factors.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-700/60">
            <p className="text-xs text-slate-400 uppercase tracking-wide pt-1">גורמים מרכזיים</p>
            <ul className="space-y-2.5">
              {analysis.factors.map((factor, i) => (
                <li key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{factor.name}</span>
                    <span className="text-slate-400 tabular-nums">{factor.impact}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(factor.impact, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expandable detailed explanation */}
        {hasDetails && (
          <>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "max-h-96" : "max-h-0"
              }`}
            >
              <p className="text-slate-300 text-sm leading-relaxed pt-1 border-t border-slate-700/60">
                {analysis.detailedExplanation}
              </p>
            </div>

            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-xs text-slate-400 hover:text-white transition-colors pt-1"
            >
              {expanded ? "סגור ▲" : "קרא עוד ▼"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
