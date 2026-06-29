"use client";

import { useState, useRef } from "react";
import { MessageCircle } from "lucide-react";

interface Props {
  symbol: string;
  companyName: string;
  context: string;
  dynamicQuestions: string[];
}

export default function FollowUpChat({ symbol, companyName, context, dynamicQuestions }: Props) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const answerRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    if (!question.trim()) return;
    setLoading(true);
    setActiveQuestion(question);
    setAnswer(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, companyName, question, context }),
      });
      const data = await res.json();
      setAnswer(res.ok ? data.answer : "שגיאה בטעינת התשובה. נסה שוב.");
    } catch {
      setAnswer("שגיאה בטעינת התשובה. נסה שוב.");
    } finally {
      setLoading(false);
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (customInput.trim()) {
      ask(customInput.trim());
      setCustomInput("");
    }
  }

  return (
    <div dir="rtl" className="bg-gray-900 rounded-2xl p-5 space-y-4">
      <p className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wide">
        <MessageCircle size={13} strokeWidth={1.75} />
        שאל שאלת המשך
      </p>

      {/* Dynamic question chips */}
      {dynamicQuestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {dynamicQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => ask(q)}
              disabled={loading}
              className={`text-right text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                activeQuestion === q && (loading || answer)
                  ? "bg-blue-900/40 border-blue-600 text-blue-300"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white"
              } disabled:opacity-50`}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Custom question input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="שאל שאלה מותאמת אישית..."
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !customInput.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
        >
          שלח
        </button>
      </form>

      {/* Answer area */}
      {(loading || answer) && (
        <div ref={answerRef} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-2">
          {activeQuestion && (
            <p className="text-xs text-slate-500 border-b border-slate-700 pb-2">{activeQuestion}</p>
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <svg className="animate-spin h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>מנתח...</span>
            </div>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">{answer}</p>
          )}
        </div>
      )}
    </div>
  );
}
