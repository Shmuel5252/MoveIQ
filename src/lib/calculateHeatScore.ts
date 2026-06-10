import { StockData } from "./types";

export function calculateHeatScore(
  stock: StockData,
  newsCount: number,
  confidence: number
): number {
  const priceScore = Math.min(Math.abs(stock.changePercent) * 10, 40);

  let volumeScore = 0;
  if (stock.volume && stock.avgVolume) {
    if (stock.volume > stock.avgVolume * 1.5) volumeScore = 20;
    else if (stock.volume > stock.avgVolume) volumeScore = 10;
  }

  const newsScore = Math.min(newsCount * 3, 20);
  const confidenceScore = confidence * 0.2;

  return Math.round(priceScore + volumeScore + newsScore + confidenceScore);
}
