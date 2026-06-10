export type RsiSignal = "overbought" | "oversold" | "neutral";

export function calculateRSISignal(
  changePercent: number,
  volume: number,
  avgVolume: number
): RsiSignal {
  const highVolume = avgVolume > 0 && volume > avgVolume * 2;
  if (changePercent > 3 && highVolume) return "overbought";
  if (changePercent < -3 && highVolume) return "oversold";
  return "neutral";
}
