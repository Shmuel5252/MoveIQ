"use client";

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { topStocks, StockEntry } from "@/lib/topStocks";

const HISTORY_KEY = "searchHistory";
const HISTORY_MAX = 6;

interface Props {
  onSearch: (symbol: string) => void;
  loading: boolean;
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

export default function SearchBar({ onSearch, loading }: Props) {
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} dir="rtl" className="w-full flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={symbol}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            disabled={loading}
            placeholder="הכנס סימול מניה (לדוגמה: TSLA)"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <ul className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
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
                      ? "bg-blue-600 text-white"
                      : "text-gray-100 hover:bg-gray-700"
                  } ${idx < suggestions.length - 1 ? "border-b border-gray-700" : ""}`}
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
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl px-4 py-3">
              <p className="text-xs text-gray-500 font-medium mb-2.5 select-none">
                חיפושים אחרונים
              </p>
              <div className="flex flex-wrap gap-2">
                {history.map((sym) => (
                  <div
                    key={sym}
                    className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg overflow-hidden transition-colors"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              מנתח...
            </>
          ) : (
            "נתח מניה"
          )}
        </button>
      </form>
    </div>
  );
}
