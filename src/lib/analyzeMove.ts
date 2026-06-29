import { GoogleGenerativeAI } from "@google/generative-ai";
import { StockData, NewsItem, AnalysisResult } from "./types";
import sanitizeJson from "./sanitizeJson";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const FALLBACK: AnalysisResult = {
  oneLiner: "",
  detailedExplanation: "",
  mainReason: "ניתוח נכשל",
  confidence: 0,
  confidenceLevel: "low",
  factors: [],
  suggestedQuestions: [],
  bullCase: [],
  bearCase: [],
  relatedSymbols: [],
  language: "he",
  enrichedNews: [],
};

function buildPrompt(stock: StockData, news: NewsItem[]): string {
  const direction = stock.change >= 0 ? "עלתה" : "ירדה";
  const noNewsReason = "לא נמצאו חדשות רלוונטיות להסביר את תנועה זו";

  const newsBlock =
    news.length > 0
      ? news
          .map(
            (item, i) =>
              `[${i + 1}] title: ${item.title}\n    summary: ${item.summary || "No summary."}\n    url: ${item.url}\n    source: ${item.source}\n    publishedAt: ${item.publishedAt}`
          )
          .join("\n\n")
      : "No recent news available.";

  return `אתה אנליסט פיננסי. נתח מדוע מניית ${stock.companyName} (${stock.symbol}) ${direction} ב-${Math.abs(stock.changePercent).toFixed(2)}% היום.

חדשות אחרונות על החברה:
${newsBlock}

הנחיות:
- הגב אך ורק ב-JSON תקין. ללא markdown, ללא גדר קוד, ללא הסבר.
- כתוב את mainReason ואת שמות הגורמים (factors.name) בעברית.
- confidenceLevel חייב להיות "high" אם confidence >= 70, "medium" אם >= 40, אחרת "low".
- אם החדשות אינן מסבירות בבירור את תנועת המניה, הגדר mainReason ל-"${noNewsReason}", confidence ל-0, confidenceLevel ל-"low", ו-factors למערך ריק.
- עבור כל כתבת חדשות: תרגם את הכותרת לעברית (title_he), כתוב סיכום בעברית של 2-3 משפטים (summary_he) בהתבסס אך ורק על שדה ה-summary המקורי — אל תמציא עובדות. העתק את url, source ו-publishedAt ללא שינוי.
- CRITICAL: For the 'impact' field in factors, you MUST use whole integer numbers between 0 and 100. Do NOT use decimals or fractions (e.g., use 70, never 0.7). The impacts represent independent scores of importance, they do NOT need to sum up to 100.
- CRITICAL: Do NOT use double-quote characters (") inside Hebrew string values. For Hebrew abbreviations that normally use double-quote (like ארה"ב or נאסד"ק), write them without the quote (ארהב, נאסדק) or spell them out fully.
- oneLiner: MUST be exactly 5-10 words in Hebrew. Think like a Bloomberg terminal headline. NEVER use filler phrases like "המניה ירדה בשל" or "המניה עלתה כי" — just state the catalyst directly. EXAMPLE (do not copy verbatim): "מתיחות גיאופוליטית ומימושי רווחים חדים בסקטור השבבים."
- suggestedQuestions: Generate exactly 3 highly relevant follow-up questions in Hebrew based specifically on this exact news event. Focus on fundamental analysis, potential impact on intrinsic value, earnings multipliers, or long-term core business metrics. DO NOT use generic or static questions. Frame them from the perspective of a serious investor looking for deep value. Return as a JSON array of 3 strings.
- detailedExplanation: MUST be a full paragraph of 2-3 long Hebrew sentences containing specific details, numbers, or context from the provided news. DO NOT repeat the oneLiner. If the provided news data is sparse or lacks deep detail, DO NOT hallucinate or repeat the core reason. Instead, provide a brief analysis based strictly on the available data, and explicitly mention that market sentiment is still developing or that specific catalysts are limited at this hour. EXAMPLE (do not copy verbatim): "המשקיעים מגיבים בחשש להסלמה במזרח התיכון, שגוררת ירידות שערים רוחביות. במקביל, לאחר ראלי ארוך מתחילת השנה, קרנות גיבוי מנצלות את ההזדמנות למימוש רווחים מהיר במניות הטכנולוגיה, מה שמכביד על מחיר המניה באופן נקודתי."
- bullCase: List exactly 3 concise bullish arguments for this stock in Hebrew. Each argument is 1 sentence max. Base them on the news and fundamentals provided.
- bearCase: List exactly 3 concise bearish arguments for this stock in Hebrew. Each argument is 1 sentence max. Be honest about risks and headwinds.
- relatedSymbols: List 4-5 ticker symbols (e.g. "AAPL", "MSFT") of companies in the same sector that would be affected by the same news catalyst. Return ONLY the ticker symbols as strings, no company names.

החזר בדיוק את מבנה ה-JSON הזה:
{
  "oneLiner": "string",
  "detailedExplanation": "string",
  "mainReason": "string",
  "confidence": number,
  "confidenceLevel": "high" | "medium" | "low",
  "factors": [{ "name": "string", "impact": integer (0-100) }],
  "suggestedQuestions": ["string", "string", "string"],
  "bullCase": ["string", "string", "string"],
  "bearCase": ["string", "string", "string"],
  "relatedSymbols": ["string", "string", "string", "string"],
  "enrichedNews": [
    {
      "title_he": "string",
      "summary_he": "string",
      "url": "string",
      "source": "string",
      "publishedAt": "string"
    }
  ]
}`;
}

export default async function analyzeMove(
  stock: StockData,
  news: NewsItem[]
): Promise<AnalysisResult> {
  process.stdout.write(`[analyzeMove] received ${news.length} articles\n`);

  if (news.length === 0) {
    return {
      oneLiner: "לא נמצאו חדשות זמינות לניתוח",
      detailedExplanation: "",
      mainReason: "לא נמצאו חדשות זמינות עבור מניה זו",
      confidence: 0,
      confidenceLevel: "low",
      factors: [],
      suggestedQuestions: [],
      bullCase: [],
      bearCase: [],
      relatedSymbols: [],
      language: "he",
      enrichedNews: [],
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const result = await model.generateContent(buildPrompt(stock, news));
    const raw = sanitizeJson(
      result.response
        .text()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim()
    );

    const parsed = JSON.parse(raw);

    return {
      oneLiner: parsed.oneLiner ?? "",
      detailedExplanation: parsed.detailedExplanation ?? "",
      mainReason: parsed.mainReason,
      confidence: parsed.confidence,
      confidenceLevel: parsed.confidenceLevel,
      factors: parsed.factors ?? [],
      suggestedQuestions: parsed.suggestedQuestions ?? [],
      bullCase: parsed.bullCase ?? [],
      bearCase: parsed.bearCase ?? [],
      relatedSymbols: parsed.relatedSymbols ?? [],
      language: "he",
      enrichedNews: parsed.enrichedNews ?? [],
    };
  } catch (error) {
    process.stdout.write(`[analyzeMove] error: ${String(error)}\n`);
    return { ...FALLBACK };
  }
}
