"use client";

interface Props {
  symbols: string[];
  onSearch: (symbol: string) => void;
}

export default function RelatedStocks({ symbols, onSearch }: Props) {
  if (!symbols.length) return null;

  return (
    <div dir="rtl" className="bg-gray-900 rounded-2xl px-5 py-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-400">מניות קשורות</h3>
      <div className="flex flex-wrap gap-2">
        {symbols.map((sym) => (
          <button
            key={sym}
            onClick={() => onSearch(sym)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 text-sm font-mono font-semibold text-gray-200 hover:text-white transition-colors"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
