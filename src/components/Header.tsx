import Link from "next/link";
import { Bell } from "lucide-react";
import { QuotaCard } from "./QuotaBadge";

export default function Header() {
  return (
    <header className="w-full border-b border-white/[0.06] bg-[#090C12]/90 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left zone (RTL start): AI Credits card */}
        <QuotaCard />

        {/* Center: Logo */}
        <Link
          href="/"
          className="flex items-baseline gap-0 select-none shrink-0"
          dir="ltr"
        >
          <span className="text-xl font-normal text-white tracking-tight">Move</span>
          <span className="text-xl font-bold text-blue-400 tracking-tight">IQ</span>
        </Link>

        {/* Right zone (RTL end): Live Market + Bell */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-semibold text-emerald-400">Live Market</span>
            </div>
            <span className="text-[10px] text-gray-500 leading-none">עודכן לפני 2 שניות</span>
          </div>
          <button
            aria-label="התראות"
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Bell size={17} strokeWidth={1.75} />
          </button>
        </div>

      </div>
    </header>
  );
}
