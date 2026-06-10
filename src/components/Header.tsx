import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-2xl mx-auto px-4 h-10 flex items-center">
        <Link href="/" className="flex items-baseline gap-0 select-none" dir="ltr">
          <span className="text-xl font-normal text-slate-800 tracking-tight">Move</span>
          <span className="text-xl font-bold text-blue-600 tracking-tight">IQ</span>
        </Link>
      </div>
    </header>
  );
}
