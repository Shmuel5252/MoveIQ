import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  try {
    const { symbol, companyName, question, context } = await req.json();

    if (!symbol || !companyName || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `You are a financial analyst answering a direct question about ${companyName} (${symbol}).

Background context (use only if relevant to the question — do not let it distract you from answering the actual question):
${context}

Question: ${question}

Answer the question directly and specifically — do not describe the company in general terms instead of answering. Answer in Hebrew, 3-5 sentences. Be specific and data-driven. Reference numbers, percentages, or concrete facts (e.g. named competitors, products, figures) where possible. Do not give investment advice. Do not repeat the question back.`;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[followup]", error);
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
  }
}
