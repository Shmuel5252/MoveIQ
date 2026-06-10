"use client";

import { useState } from "react";
import { EnrichedNewsItem } from "@/lib/types";

interface Props {
  news: EnrichedNewsItem[];
}

const PAGE_SIZE = 5;

export default function NewsSection({ news }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (news.length === 0) {
    return <p className="text-gray-400 text-sm">לא נמצאו חדשות רלוונטיות</p>;
  }

  const shown = news.slice(0, visible);
  const hasMore = visible < news.length;

  return (
    <div className="space-y-3">
      {shown.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          dir="rtl"
          className="block bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-blue-400">{item.source}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {new Date(item.publishedAt).toLocaleDateString("he-IL", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="text-white font-semibold text-base leading-snug mb-1.5">
            {item.title_he}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
            {item.summary_he}
          </p>
        </a>
      ))}

      {hasMore && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full py-3 text-sm font-semibold text-blue-400 hover:text-blue-300 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
        >
          עוד חדשות
        </button>
      )}
    </div>
  );
}
