"use client";

import { Bell, Newspaper, TrendingUp, TrendingDown } from "lucide-react";
import { TimelineEvent } from "@/lib/buildTimeline";

interface Props {
  events: TimelineEvent[];
}

// Splits "המניה עלתה 2.3% תוך 30 דקות" into text + colored pct + text
function PriceDescription({ description, direction }: { description: string; direction?: "up" | "down" }) {
  const pctColor = direction === "up" ? "text-emerald-400" : "text-red-400";
  const parts = description.split(/(\d+\.\d+%)/);
  return (
    <>
      {parts.map((part, i) =>
        /\d+\.\d+%/.test(part)
          ? <span key={i} className={`font-medium ${pctColor}`}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export default function Timeline({ events }: Props) {
  return (
    <div dir="rtl" className="space-y-0">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;

        let Icon: typeof Bell;
        let dotColor: string;

        if (event.type === "market") {
          Icon = Bell;
          dotColor = "bg-blue-500";
        } else if (event.type === "news") {
          Icon = Newspaper;
          dotColor = "bg-slate-600";
        } else {
          Icon = event.direction === "up" ? TrendingUp : TrendingDown;
          dotColor = event.direction === "up" ? "bg-emerald-500" : "bg-red-500";
        }

        return (
          <div key={i} className="flex items-start gap-3">
            {/* Time */}
            <span
              className="text-xs text-slate-500 tabular-nums pt-1 w-10 shrink-0 text-left"
              dir="ltr"
            >
              {event.time}
            </span>

            {/* Spine: dot + connecting line */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${dotColor}`} />
              {!isLast && <div className="w-px flex-1 bg-slate-700 min-h-[20px]" />}
            </div>

            {/* Event content — description always light, only pct token colored */}
            <div className="flex items-start gap-1.5 pb-3 min-w-0 text-slate-200">
              <Icon size={14} strokeWidth={1.75} className="text-slate-500 shrink-0 mt-0.5" />
              <span className="text-sm leading-snug">
                {event.type === "price"
                  ? <PriceDescription description={event.description} direction={event.direction} />
                  : event.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
