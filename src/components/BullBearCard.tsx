"use client";

interface Props {
  bullCase: string[];
  bearCase: string[];
}

export default function BullBearCard({ bullCase, bearCase }: Props) {
  if (!bullCase.length && !bearCase.length) return null;

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-3">
      {/* Bear — right column in RTL */}
      <div className="rounded-xl p-4 bg-[#1f0d0d] border border-red-900 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-red-400">
          <span>🐻</span>
          <span>דובי</span>
        </h3>
        <ul className="space-y-2">
          {bearCase.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300 leading-snug">
              <span className="text-red-400 shrink-0 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bull — left column in RTL */}
      <div className="rounded-xl p-4 bg-[#0d2318] border border-green-900 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-green-400">
          <span>🐂</span>
          <span>שורי</span>
        </h3>
        <ul className="space-y-2">
          {bullCase.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300 leading-snug">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
