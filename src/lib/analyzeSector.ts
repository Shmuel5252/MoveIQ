import { GoogleGenerativeAI } from "@google/generative-ai";
import sanitizeJson from "./sanitizeJson";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export interface SectorStockMove {
  symbol: string;
  companyName: string;
  changePercent: number;
}

export interface SectorAnalysisResult {
  sectorTrend: string;
  leadingMovers: Array<{ symbol: string; reason: string }>;
  opportunityFactors: string[];
  riskFactors: string[];
}

function buildPrompt(sectorLabel: string, stocks: SectorStockMove[]): string {
  const stocksBlock = stocks
    .map(
      (s) =>
        `${s.symbol} (${s.companyName}): ${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(2)}%`
    )
    .join("\n");

  return `אתה אנליסט פיננסי. נתח את מצב סקטור "${sectorLabel}" היום, בהתבסס על נתוני התנועה של המניות המובילות בו:

${stocksBlock}

הנחיות:
- הגב אך ורק ב-JSON תקין. ללא markdown, ללא גדר קוד, ללא הסבר.
- כתוב הכל בעברית.
- sectorTrend: משפט אחד-שניים שמסכם את מגמת הסקטור היום (עולה/יורד/מעורב, ובאיזו עוצמה), בהתבסס על הנתונים שסופקו בלבד.
- leadingMovers: 3-4 מהמניות שהניעו הכי הרבה את התנועה (חיוביות או שליליות), עם משפט קצר שמסביר למה היא בולטת.
- opportunityFactors: 2-3 גורמי הזדמנות לסקטור, מבוססים על המגמה שנצפתה.
- riskFactors: 2-3 גורמי סיכון לסקטור, מבוססים על המגמה שנצפתה.
- אל תמציא חדשות או אירועים ספציפיים שלא ניתן להסיק מהנתונים — התבסס על כיוון ועוצמת התנועה בלבד.
- CRITICAL: אל תשתמש בתווי גרשיים כפולים (") בתוך מחרוזות עבריות.

החזר בדיוק את מבנה ה-JSON הזה:
{
  "sectorTrend": "string",
  "leadingMovers": [{ "symbol": "string", "reason": "string" }],
  "opportunityFactors": ["string"],
  "riskFactors": ["string"]
}`;
}

export default async function analyzeSector(
  sectorLabel: string,
  stocks: SectorStockMove[]
): Promise<SectorAnalysisResult | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(buildPrompt(sectorLabel, stocks));
    const text = sanitizeJson(
      result.response
        .text()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim()
    );

    const parsed = JSON.parse(text);

    return {
      sectorTrend: parsed.sectorTrend ?? "",
      leadingMovers: parsed.leadingMovers ?? [],
      opportunityFactors: parsed.opportunityFactors ?? [],
      riskFactors: parsed.riskFactors ?? [],
    };
  } catch (error) {
    process.stdout.write(`[analyzeSector] error: ${String(error)}\n`);
    return null;
  }
}
