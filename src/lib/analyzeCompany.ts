import { GoogleGenerativeAI } from "@google/generative-ai";
import sanitizeJson from "./sanitizeJson";
import { CompanyProfile } from "./types";
import { RawCompanyProfile } from "./fetchCompanyProfile";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

function buildPrompt(raw: RawCompanyProfile): string {
  return `אתה אנליסט פיננסי שמסביר חברות למשקיעים ישראלים, בעברית פשוטה וקולחת.

מידע גולמי על החברה (מ-Yahoo Finance, באנגלית):
תיאור: ${raw.longBusinessSummary}
סקטור: ${raw.sector ?? "לא ידוע"}
תת-תחום: ${raw.industry ?? "לא ידוע"}
${raw.fullTimeEmployees ? `מספר עובדים: ${raw.fullTimeEmployees.toLocaleString()}` : ""}
${raw.country ? `מדינת מקור: ${raw.country}` : ""}

הנחיות:
- הגב אך ורק ב-JSON תקין. ללא markdown, ללא גדר קוד, ללא הסבר.
- אל תתרגם מילה במילה — נסח מחדש בעברית טבעית וקולחת, כאילו אתה מסביר לחבר.
- whatTheyDo: 2-3 משפטים שמסבירים מה החברה עושה בפועל ובאיזה מוצרים/שירותים היא עוסקת.
- sector_he: תרגום עברי טבעי של הסקטור (לדוגמה: "Technology" → "טכנולוגיה", "Consumer Cyclical" → "מוצרי צריכה מחזוריים", "Healthcare" → "בריאות").
- industry_he: תרגום עברי טבעי של תת-התחום.
- uniqueValue: 1-2 משפטים על מה שמייחד את החברה או נותן לה יתרון תחרותי, אם ניתן להסיק מהתיאור. אם אין מידע מספיק להסיק יתרון ספציפי — כתוב משפט כללי וזהיר בלי להמציא עובדות.
- CRITICAL: אל תשתמש בתווי גרשיים כפולים (") בתוך מחרוזות עבריות.

החזר בדיוק את מבנה ה-JSON הזה:
{
  "whatTheyDo": "string",
  "sector_he": "string",
  "industry_he": "string",
  "uniqueValue": "string"
}`;
}

export default async function analyzeCompany(
  raw: RawCompanyProfile
): Promise<CompanyProfile | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(buildPrompt(raw));
    const text = sanitizeJson(
      result.response
        .text()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim()
    );

    const parsed = JSON.parse(text);

    return {
      whatTheyDo: parsed.whatTheyDo ?? "",
      sector_he: parsed.sector_he ?? "",
      industry_he: parsed.industry_he ?? "",
      uniqueValue: parsed.uniqueValue ?? "",
    };
  } catch (error) {
    process.stdout.write(`[analyzeCompany] error: ${String(error)}\n`);
    return null;
  }
}
