import Link from "next/link";
import QuotaBadge from "./QuotaBadge";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-[#0d1117]/85 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-10 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-0 select-none" dir="ltr">
          <span className="text-xl font-normal text-gray-300 tracking-tight">Move</span>
          <span className="text-xl font-bold text-blue-400 tracking-tight">IQ</span>
        </Link>
        <QuotaBadge />
      </div>
    </header>
  );
}
