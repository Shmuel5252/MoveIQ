"use client";

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { Sparkles, Search } from "lucide-react";
import { topStocks, StockEntry } from "@/lib/topStocks";

const HISTORY_KEY = "searchHistory";
const HISTORY_MAX = 6;

interface Props {
  onSearch: (symbol: string) => void;
  loading: boolean;
  onInputFocus?: () => void; // called when user focuses input — lets parent clear results
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(next: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch { /* quota exceeded — ignore */ }
}

// ── Autocomplete filter ───────────────────────────────────────────────────────

function getSuggestions(query: string): StockEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const bySymbol = topStocks.filter((s) => s.symbol.toLowerCase().startsWith(q));
  const byName = topStocks.filter(
    (s) => !s.symbol.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q),
  );
  return [...bySymbol, ...byName].slice(0, 5);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SearchBar({ onSearch, loading, onInputFocus }: Props) {
  const [symbol, setSymbol] = useState("");
  const [suggestions, setSuggestions] = useState<StockEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);       // autocomplete dropdown
  const [focused, setFocused] = useState(false); // input is focused (for history)
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history on mount (localStorage is not available during SSR)
  useEffect(() => {
    setHistory(readHistory());
  }, []);

  // Close both dropdowns on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // ── Core search action (single source of truth) ───────────────────────────

  function triggerSearch(sym: string) {
    const upper = sym.trim().toUpperCase();
    if (!upper) return;

    // Update history: most-recent first, no duplicates, max 6
    const next = [upper, ...readHistory().filter((s) => s !== upper)].slice(0, HISTORY_MAX);
    writeHistory(next);
    setHistory(next);

    setSymbol(upper);
    setSuggestions([]);
    setOpen(false);
    setFocused(false);
    setActiveIdx(-1);
    onSearch(upper);
  }

  // ── Input handlers ────────────────────────────────────────────────────────

  function handleInputChange(value: string) {
    setSymbol(value);
    const results = getSuggestions(value);
    setSuggestions(results);
    setActiveIdx(-1);
    setOpen(results.length > 0);
  }

  function handleFocus() {
    setFocused(true);
    onInputFocus?.(); // signal parent to clear previous results
    // If input already has text, re-open autocomplete
    if (symbol.trim()) {
      const results = getSuggestions(symbol);
      setSuggestions(results);
      setOpen(results.length > 0);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setFocused(false);
      setActiveIdx(-1);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      triggerSearch(suggestions[activeIdx].symbol);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    triggerSearch(symbol);
  }

  function removeHistory(sym: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = history.filter((s) => s !== sym);
    writeHistory(next);
    setHistory(next);
  }

  // ── Visibility flags ──────────────────────────────────────────────────────

  const showSuggestions = open && suggestions.length > 0;
  const showHistory = focused && !symbol.trim() && history.length > 0 && !showSuggestions;
  // Show a "type any symbol" hint when user typed something but got no matches
  const showNoMatchHint = focused && symbol.trim().length >= 2 && !showSuggestions;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} dir="rtl" className="w-full flex flex-col gap-3">
        <div className="relative">
          {/* Search icon — right side (RTL) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={16} strokeWidth={1.75} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={symbol}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => { handleFocus(); e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.2)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            disabled={loading}
            placeholder="הכנס סימול מניה (לדוגמה: TSLA)"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-[#1F2937] border border-white/[0.12] rounded-[14px] pr-10 pl-5 py-4 text-white placeholder-[#6B7280] text-base focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ boxShadow: "none" }}
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <ul className="absolute z-50 w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl">
              {suggestions.map((stock, idx) => (
                <li
                  key={stock.symbol}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    triggerSearch(stock.symbol);
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer select-none transition-colors ${
                    idx === activeIdx
                      ? "bg-blue-600/80 text-white"
                      : "text-gray-100 hover:bg-white/[0.04]"
                  } ${idx < suggestions.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                >
                  <span className="font-bold text-sm tracking-widest shrink-0">
                    {stock.symbol}
                  </span>
                  <span
                    className={`text-sm truncate ms-3 ${
                      idx === activeIdx ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {stock.name}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Recent searches */}
          {showHistory && (
            <div className="absolute z-50 w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs text-gray-500 font-medium select-none">חיפושים אחרונים</p>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    writeHistory([]);
                    setHistory([]);
                    setFocused(false);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors select-none"
                >
                  נקה הכל
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((sym) => (
                  <div
                    key={sym}
                    className="flex items-center bg-white/[0.06] hover:bg-white/10 rounded-lg overflow-hidden transition-colors"
                  >
                    <span
                      onMouseDown={(e) => {
                        e.preventDefault();
                        triggerSearch(sym);
                      }}
                      className="pl-3 pr-1.5 py-1.5 text-sm font-bold font-mono tracking-widest text-gray-100 cursor-pointer select-none"
                    >
                      {sym}
                    </span>
                    <span
                      onMouseDown={(e) => removeHistory(sym, e)}
                      role="button"
                      aria-label={`הסר ${sym}`}
                      className="pr-2.5 pl-1 py-1.5 text-gray-500 hover:text-gray-200 cursor-pointer select-none text-xs leading-none"
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint when symbol not in autocomplete list */}
          {showNoMatchHint && (
            <div className="absolute z-50 w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl px-4 py-3">
              <p className="text-xs text-gray-500 text-center">
                לחץ &quot;חפש מניה&quot; לחיפוש ישיר — הסימול לא בפתרון האוטומטי אבל עשוי לקיים
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150"
          style={{
            background: loading ? "#2563EB" : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow: loading ? "none" : "0 0 20px rgba(37,99,235,0.45), 0 4px 16px rgba(37,99,235,0.25)",
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px rgba(59,130,246,0.6), 0 4px 20px rgba(37,99,235,0.35)";
          }}
          onMouseLeave={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(37,99,235,0.45), 0 4px 16px rgba(37,99,235,0.25)";
          }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              טוען...
            </>
          ) : (
            <>
              <Sparkles size={18} strokeWidth={1.75} />
              חפש מניה
            </>
          )}
        </button>
      </form>
    </div>
  );
}
