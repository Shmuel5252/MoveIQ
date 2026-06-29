"use client";

import { useState } from "react";
import { FileText, Lightbulb, ChevronDown } from "lucide-react";
import { CompanyProfile } from "@/lib/types";
import FollowUpChat from "./FollowUpChat";

const COMPANY_QUESTIONS = [
  "מי המתחרים העיקריים שלה?",
  "איך החברה מרוויחה כסף בעיקר?",
  "מה הסיכונים המרכזיים שעומדים בפניה?",
];

interface Props {
  symbol: string;
  companyName: string;
}

export default function CompanyProfileSection({ symbol, companyName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [available, setAvailable] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  async function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }

    if (fetched) {
      setOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/company-profile?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      setAvailable(!!data.available);
      if (data.available) setProfile(data.profile);
    } catch {
      setAvailable(false);
    } finally {
      setFetched(true);
      setLoading(false);
      setOpen(true);
    }
  }

  return (
    <div dir="rtl" className="bg-gray-900 rounded-2xl overflow-hidden">
      <button
        onClick={handleToggle}
        disabled={loading}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-60"
      >
        <span className="flex items-center gap-2">
          <FileText size={15} strokeWidth={1.75} className="text-gray-500" />
          סיכום חברה
        </span>
        {loading ? (
          <div className="h-3.5 w-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && fetched && (
        <div className="px-5 pb-5 animate-in slide-in-from-top-2">
          {!available ? (
            <p className="text-sm text-gray-500 text-center py-2 border-t border-white/10 pt-4">
              אין מידע נוסף על החברה הזו
            </p>
          ) : profile ? (
            <div className="space-y-4 border-t border-white/10 pt-4">
              {/* Sector / industry pills */}
              <div className="flex flex-wrap gap-2">
                {profile.sector_he && (
                  <span className="rounded-full px-3 py-1 bg-gray-800 border border-gray-700/60 text-xs text-gray-300">
                    {profile.sector_he}
                  </span>
                )}
                {profile.industry_he && (
                  <span className="rounded-full px-3 py-1 bg-gray-800 border border-gray-700/60 text-xs text-gray-400">
                    {profile.industry_he}
                  </span>
                )}
              </div>

              {/* What they do */}
              {profile.whatTheyDo && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">מה החברה עושה</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{profile.whatTheyDo}</p>
                </div>
              )}

              {/* Unique value */}
              {profile.uniqueValue && (
                <div className="rounded-xl bg-blue-950/30 border border-blue-800/30 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-blue-400/90 mb-1 font-medium">
                    <Lightbulb size={13} strokeWidth={1.75} />
                    מה מיוחד בה
                  </p>
                  <p className="text-sm text-gray-200 leading-relaxed">{profile.uniqueValue}</p>
                </div>
              )}

              {/* Ask about the company */}
              <FollowUpChat
                symbol={symbol}
                companyName={companyName}
                context={`${profile.sector_he} · ${profile.industry_he}\n${profile.whatTheyDo}\n${profile.uniqueValue}`}
                dynamicQuestions={COMPANY_QUESTIONS}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
