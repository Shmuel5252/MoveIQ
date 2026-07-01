"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, TrendingUp, Clock, X, Search } from "lucide-react";

const HISTORY_KEY = "searchHistory";

const NAV_ITEMS = [
  { href: "/",         icon: Home,       label: "בית" },
  { href: "/discover", icon: Compass,    label: "גלה" },
  { href: "/movers",   icon: TrendingUp, label: "תנועות" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!historyOpen) return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setHistory(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setHistory([]);
    }
  }, [historyOpen]);

  useEffect(() => {
    if (!historyOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-bottom-nav]")) setHistoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [historyOpen]);

  return (
    <>
      {/* History drawer */}
      {historyOpen && (
        <div
          data-bottom-nav
          className="fixed bottom-16 inset-x-0 z-40 mx-auto max-w-2xl px-3"
        >
          <div className="rounded-2xl bg-[#111827] border border-white/[0.06] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-white">חיפושים אחרונים</p>
              <button
                onClick={() => setHistoryOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">אין חיפושים אחרונים</p>
            ) : (
              <ul className="py-2">
                {history.map((sym) => (
                  <li key={sym}>
                    <Link
                      href={`/?q=${sym}`}
                      onClick={() => setHistoryOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                    >
                      <Search size={14} className="text-gray-500 shrink-0" />
                      <span className="font-mono font-bold text-sm text-gray-200 tracking-widest">
                        {sym}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Nav bar */}
      <nav
        data-bottom-nav
        className="fixed bottom-0 inset-x-0 z-40 bg-[#111827] border-t border-white/[0.06]"
        style={{ height: 64 }}
      >
        <div className="max-w-2xl mx-auto h-full flex items-center justify-around px-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 min-w-[56px] group"
              >
                <div className="relative flex flex-col items-center">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.25 : 1.75}
                    className={`transition-colors ${
                      active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />
                  {active && (
                    <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-blue-400" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors mt-1 ${
                    active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* History button */}
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex flex-col items-center gap-1 min-w-[56px] group"
          >
            <div className="relative flex flex-col items-center">
              <Clock
                size={22}
                strokeWidth={historyOpen ? 2.25 : 1.75}
                className={`transition-colors ${
                  historyOpen ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {historyOpen && (
                <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </div>
            <span
              className={`text-[11px] font-medium transition-colors mt-1 ${
                historyOpen ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
              }`}
            >
              היסטוריה
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
