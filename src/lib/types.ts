export interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface EnrichedNewsItem {
  title_he: string;
  summary_he: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface AnalysisResult {
  oneLiner: string;
  detailedExplanation: string;
  mainReason: string;
  confidence: number;
  confidenceLevel: "high" | "medium" | "low";
  factors: Array<{
    name: string;
    impact: number;
  }>;
  suggestedQuestions: string[];
  language: "he" | "en";
  enrichedNews: EnrichedNewsItem[];
}

export interface StockPageData {
  stock: StockData;
  news: NewsItem[];
  analysis: AnalysisResult;
}
