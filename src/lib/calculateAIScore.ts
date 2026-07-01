import { StockData } from "./types";
import { calculateHeatScore } from "./calculateHeatScore";

function fundamentalScore(stock: StockData): number {
  let score = 0;
  let factors = 0;

  // P/E ratio (trailing)
  if (stock.peRatio != null && stock.peRatio > 0) {
    if (stock.peRatio < 15)      score += 90;
    else if (stock.peRatio < 25) score += 70;
    else if (stock.peRatio < 40) score += 50;
    else                         score += 25;
    factors++;
  } else {
    score += 50; // neutral when no data
    factors++;
  }

  // Beta (volatility vs market)
  if (stock.beta != null) {
    if (stock.beta >= 0.8 && stock.beta <= 1.2) score += 80;
    else if (stock.beta < 0.8)                  score += 60;
    else if (stock.beta <= 1.5)                 score += 45;
    else                                         score += 30;
    factors++;
  }

  // Dividend yield bonus
  if (stock.dividendYield != null && stock.dividendYield > 2) {
    score += 10;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 50;
}

export function calculateAIScore(
  stock: StockData,
  newsCount: number,
  confidence: number
): number {
  const heat = calculateHeatScore(stock, newsCount, confidence);
  const fundamental = fundamentalScore(stock);
  return Math.min(99, Math.round(heat * 0.7 + fundamental * 0.3));
}
