"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import MoverCard, { type MoverData } from "./MoverCard";

const PERIODS = [
  { label: "יום",      id: "day"      },
  { label: "שבוע",     id: "week"     },
  { label: "חודש",     id: "month"    },
  { label: "3 חודשים", id: "3months"  },
  { label: "שנה",      id: "year"     },
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

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

export default function MoversTabView({ dayGainers, dayLosers }: Props) {
  const [period, setPeriod] = useState<PeriodId>("day");
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cache, setCache] = useState<Record<string, PeriodData>>({
    day: { gainers: dayGainers, losers: dayLosers },
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  async function handlePeriodChange(newPeriod: PeriodId) {
    setDropdownOpen(false);
    if (newPeriod === period) return;
    setPeriod(newPeriod);

    if (cache[newPeriod]) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/movers?period=${newPeriod}`);
      if (res.ok) {
        const data: PeriodData = await res.json();
        setCache((prev) => ({ ...prev, [newPeriod]: data }));
      }
    } catch {
      // silently fail — skeleton persists
    } finally {
      setLoading(false);
    }
  }

  const currentPeriodLabel = PERIODS.find((p) => p.id === period)?.label ?? "יום";
  const currentData = cache[period];
  const movers = tab === "gainers"
    ? (currentData?.gainers ?? [])
    : (currentData?.losers ?? []);
  const type = tab === "gainers" ? "gainer" : "loser";
  const isLoading = loading && !currentData;

  return (
    <div>
      {/* Controls row: period dropdown + gainers/losers toggle */}
      <div className="flex items-center gap-3 mb-5">
        {/* Period dropdown */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-200 transition-colors select-none"
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.75} />
              תקופה: {currentPeriodLabel}
            </span>
            <span
              className={`text-gray-400 text-[10px] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {dropdownOpen && (
            <ul className="absolute z-50 top-full mt-1 right-0 min-w-[9rem] bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
              {PERIODS.map((p) => (
                <li
                  key={p.id}
                  onMouseDown={() => handlePeriodChange(p.id)}
                  className={`px-4 py-2.5 text-sm cursor-pointer select-none transition-colors ${
                    p.id === period
                      ? "bg-blue-600 text-white"
                      : "text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  {p.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gainers / Losers toggle */}
        <div className="flex flex-1 gap-2">
          <button
            onClick={() => setTab("gainers")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              tab === "gainers"
                ? "bg-emerald-600 text-white"
                : "bg-[#1f2937] text-emerald-400"
            }`}
          >
            עולות
          </button>
          <button
            onClick={() => setTab("losers")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              tab === "losers"
                ? "bg-red-600 text-white"
                : "bg-[#1f2937] text-red-400"
            }`}
          >
            יורדות
          </button>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <SkeletonCards />
      ) : movers.length === 0 ? (
        <p className="text-center text-gray-500 py-10 text-sm">אין נתונים זמינים כרגע</p>
      ) : (
        <div className="space-y-3">
          {movers.map((mover) => (
            <MoverCard key={mover.symbol} mover={mover} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
