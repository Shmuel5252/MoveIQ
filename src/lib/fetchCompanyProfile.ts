import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface RawCompanyProfile {
  longBusinessSummary: string;
  sector?: string;
  industry?: string;
  fullTimeEmployees?: number;
  website?: string;
  country?: string;
}

// Returns null when the symbol has no business summary (e.g. ETFs, indices).
export default async function fetchCompanyProfile(
  symbol: string
): Promise<RawCompanyProfile | null> {
  try {
    const summary = await yf.quoteSummary(symbol, { modules: ["assetProfile"] });
    const profile = summary?.assetProfile;

    if (!profile?.longBusinessSummary) return null;

    return {
      longBusinessSummary: profile.longBusinessSummary,
      sector: profile.sector,
      industry: profile.industry,
      fullTimeEmployees: profile.fullTimeEmployees,
      website: profile.website,
      country: profile.country,
    };
  } catch {
    return null;
  }
}
