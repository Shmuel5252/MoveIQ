"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import MoverCard, { type MoverData } from "./MoverCard";

const PERIODS = [
  { label: "יום",  id: "day"     },
  { label: "עוד",  id: "week"    }, // maps to week
  { label: "שבוע", id: "month"   },
  { label: "3M",   id: "3months" },
  { label: "YTD",  id: "ytd"     },
  { label: "שנה",  id: "year"    },
] as const;

type PeriodId = (typeof PERIODS)[number]["id"];

interface PeriodData {
  gainers: MoverData[];
  losers: MoverData[];
}

interface Props {
  dayGainers: MoverData[];
  dayLosers: MoverData[];
}

const INITIAL_SHOW = 5;

// Decorative sparkline for overview cards
const OV_UP   = "4,22 14,18 24,20 34,14 44,16 54,10 64,12 76,5";
const OV_DOWN = "4,5  14,9  24,7  34,13 44,11 54,17 64,15 76,22";

function OverviewSparkline({ up }: { up: boolean }) {
  const stroke = up ? "#10b981" : "#ef4444";
  return (
    <svg width="80" height="28" viewBox="0 0 80 28" fill="none" className="opacity-75">
      <polyline points={up ? OV_UP : OV_DOWN} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonCard() {
  return <div className="h-[62px] rounded-2xl bg-white/[0.04] animate-pulse" />;
}


type TabId = "gainers" | "losers";

export default function MoversTabView({ dayGainers, dayLosers }: Props) {
  const [period, setPeriod] = useState<PeriodId>("day");
  const [tab, setTab] = useState<TabId>("gainers"); // persists across period changes
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, PeriodData>>({
    day: { gainers: dayGainers, losers: dayLosers },
  });
  const [showAll, setShowAll] = useState(false);

  async function handlePeriodChange(newPeriod: PeriodId) {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setShowAll(false); // reset expand when period changes, but NOT tab
    if (cache[newPeriod]) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movers?period=${newPeriod}`);
      if (res.ok) {
        const data: PeriodData = await res.json();
        setCache((prev) => ({ ...prev, [newPeriod]: data }));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  function handleTabChange(newTab: TabId) {
    if (newTab === tab) return;
    setTab(newTab);
    setShowAll(false);
  }

  const currentData = cache[period];
  const gainers = currentData?.gainers ?? [];
  const losers  = currentData?.losers  ?? [];
  const isLoading = loading && !currentData;

  const avgGain = gainers.length
    ? gainers.reduce((s, m) => s + m.changePercent, 0) / gainers.length
    : 0;
  const avgLoss = losers.length
    ? losers.reduce((s, m) => s + m.changePercent, 0) / losers.length
    : 0;

  const activeList = tab === "gainers" ? gainers : losers;
  const visibleList = showAll ? activeList : activeList.slice(0, INITIAL_SHOW);
  const activeType: "gainer" | "loser" = tab === "gainers" ? "gainer" : "loser";

  return (
    <div className="space-y-5">

      {/* Period segmented pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {PERIODS.map((p) => {
          const active = p.id === period;
          return (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                  : "bg-white/[0.05] text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Overview summary cards — always visible */}
      <div className="grid grid-cols-2 gap-3" dir="rtl">
        <div
          className={`bg-[#111827] border rounded-2xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
            tab === "gainers" ? "border-emerald-500/30 shadow-md shadow-emerald-900/20" : "border-white/[0.06]"
          }`}
          onClick={() => handleTabChange("gainers")}
        >
          <div className="flex items-center justify-between">
            <TrendingUp size={16} strokeWidth={2} className="text-emerald-400" />
            <span className="text-[11px] text-gray-500 font-medium">העולות המובילות</span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xl font-extrabold text-emerald-400 tabular-nums leading-none">
                +{avgGain.toFixed(2)}%
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">עליות הגבוהות ביותר</p>
            </div>
            <OverviewSparkline up={true} />
          </div>
        </div>

        <div
          className={`bg-[#111827] border rounded-2xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
            tab === "losers" ? "border-red-500/30 shadow-md shadow-red-900/20" : "border-white/[0.06]"
          }`}
          onClick={() => handleTabChange("losers")}
        >
          <div className="flex items-center justify-between">
            <TrendingDown size={16} strokeWidth={2} className="text-red-400" />
            <span className="text-[11px] text-gray-500 font-medium">היורדות המובילות</span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xl font-extrabold text-red-400 tabular-nums leading-none">
                {avgLoss.toFixed(2)}%
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">ירידות הגבוהות ביותר</p>
            </div>
            <OverviewSparkline up={false} />
          </div>
        </div>
      </div>

      {/* Sliding tab switcher */}
      <div className="relative flex bg-[#1F2937] rounded-full p-1" dir="ltr">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-full transition-transform duration-[250ms] ease-in-out"
          style={{
            width: "50%",
            background: tab === "gainers" ? "#059669" : "#dc2626",
            transform: tab === "gainers" ? "translateX(0)" : "translateX(100%)",
          }}
        />
        <button
          onClick={() => handleTabChange("gainers")}
          className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-full transition-colors duration-200 ${
            tab === "gainers" ? "text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          עולות
        </button>
        <button
          onClick={() => handleTabChange("losers")}
          className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-full transition-colors duration-200 ${
            tab === "losers" ? "text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          יורדות
        </button>
      </div>

      {/* Single active list — fades when tab/period changes */}
      <div
        key={`${tab}-${period}`}
        className="animate-fade-in bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden"
      >
        {/* Section header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <ChevronDown size={13} strokeWidth={2} />
            מיין לפי: שינוי %
          </button>
          <span
            className={`flex items-center gap-1.5 text-sm font-bold ${
              tab === "gainers" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {tab === "gainers" ? "עולות" : "יורדות"}
            {tab === "gainers"
              ? <TrendingUp size={16} strokeWidth={2.5} />
              : <TrendingDown size={16} strokeWidth={2.5} />
            }
          </span>
        </div>

        {/* Cards */}
        <div className="px-3 pb-3 space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : visibleList.length === 0
            ? <p className="text-center text-gray-500 py-6 text-sm">אין נתונים זמינים</p>
            : visibleList.map((m) => (
                <MoverCard key={m.symbol} mover={m} type={activeType} />
              ))
          }
        </div>

        {/* Show more */}
        {activeList.length > INITIAL_SHOW && !isLoading && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
          >
            <ChevronDown
              size={15}
              strokeWidth={2}
              className={`transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
            />
            {showAll ? "הצג פחות" : `הצג עוד (${activeList.length - INITIAL_SHOW})`}
          </button>
        )}
      </div>

    </div>
  );
}
