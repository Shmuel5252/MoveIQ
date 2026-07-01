// Decorative, non-interactive background for the whole app — fixed behind
// all content. Pure presentation, no state/hooks, so it stays a Server
// Component (renders once, ships no JS).

interface CandleSpec {
  top: number; // % from top of viewport
  right: number; // % from right edge of viewport (left cluster candles still use `right`, just larger values)
  bodyHeight: number;
  wickAbove: number;
  wickBelow: number;
  color: "blue" | "teal" | "navy";
  opacity: number;
}

const COLOR_HEX: Record<CandleSpec["color"], string> = {
  blue: "#1e40af",
  teal: "#0e7490",
  navy: "#1e3a8a",
};

// Main cluster — concentrated top-right, ascending diagonal (lower price action
// bottom-left of the cluster, rising toward the top-right corner).
const MAIN_CLUSTER: CandleSpec[] = [
  { top: 56, right: 38, bodyHeight: 26, wickAbove: 8, wickBelow: 9, color: "navy", opacity: 0.5 },
  { top: 50, right: 35, bodyHeight: 22, wickAbove: 7, wickBelow: 8, color: "teal", opacity: 0.55 },
  { top: 53, right: 33, bodyHeight: 30, wickAbove: 9, wickBelow: 10, color: "blue", opacity: 0.5 },
  { top: 46, right: 30, bodyHeight: 24, wickAbove: 8, wickBelow: 7, color: "navy", opacity: 0.55 },
  { top: 42, right: 28, bodyHeight: 34, wickAbove: 10, wickBelow: 11, color: "teal", opacity: 0.55 },
  { top: 38, right: 25, bodyHeight: 28, wickAbove: 8, wickBelow: 9, color: "blue", opacity: 0.6 },
  { top: 40, right: 23, bodyHeight: 36, wickAbove: 11, wickBelow: 10, color: "navy", opacity: 0.55 },
  { top: 32, right: 20, bodyHeight: 30, wickAbove: 9, wickBelow: 8, color: "teal", opacity: 0.6 },
  { top: 28, right: 18, bodyHeight: 40, wickAbove: 12, wickBelow: 12, color: "blue", opacity: 0.6 },
  { top: 30, right: 15, bodyHeight: 34, wickAbove: 10, wickBelow: 9, color: "navy", opacity: 0.6 },
  { top: 22, right: 13, bodyHeight: 44, wickAbove: 13, wickBelow: 12, color: "teal", opacity: 0.65 },
  { top: 18, right: 10, bodyHeight: 38, wickAbove: 11, wickBelow: 11, color: "blue", opacity: 0.65 },
  { top: 20, right: 8, bodyHeight: 48, wickAbove: 14, wickBelow: 13, color: "navy", opacity: 0.65 },
  { top: 12, right: 6, bodyHeight: 42, wickAbove: 12, wickBelow: 11, color: "teal", opacity: 0.7 },
  { top: 14, right: 4, bodyHeight: 52, wickAbove: 15, wickBelow: 14, color: "blue", opacity: 0.7 },
  { top: 8, right: 2, bodyHeight: 46, wickAbove: 13, wickBelow: 12, color: "navy", opacity: 0.7 },
];

// Small secondary cluster, bottom-left — fewer candles, fainter.
const MINOR_CLUSTER: CandleSpec[] = [
  { top: 88, right: 95, bodyHeight: 18, wickAbove: 6, wickBelow: 5, color: "teal", opacity: 0.32 },
  { top: 80, right: 92, bodyHeight: 24, wickAbove: 7, wickBelow: 6, color: "blue", opacity: 0.32 },
  { top: 85, right: 89, bodyHeight: 16, wickAbove: 5, wickBelow: 5, color: "navy", opacity: 0.28 },
  { top: 75, right: 87, bodyHeight: 22, wickAbove: 6, wickBelow: 7, color: "teal", opacity: 0.28 },
  { top: 82, right: 84, bodyHeight: 14, wickAbove: 5, wickBelow: 4, color: "blue", opacity: 0.25 },
  { top: 92, right: 91, bodyHeight: 20, wickAbove: 6, wickBelow: 6, color: "navy", opacity: 0.25 },
  { top: 78, right: 82, bodyHeight: 18, wickAbove: 5, wickBelow: 6, color: "teal", opacity: 0.22 },
  { top: 95, right: 94, bodyHeight: 12, wickAbove: 4, wickBelow: 4, color: "blue", opacity: 0.22 },
];

function Candle({ spec }: { spec: CandleSpec }) {
  const hex = COLOR_HEX[spec.color];
  const totalHeight = spec.bodyHeight + spec.wickAbove + spec.wickBelow;

  return (
    <div
      className="absolute"
      style={{ top: `${spec.top}%`, right: `${spec.right}%`, opacity: spec.opacity }}
    >
      <div className="relative flex items-center justify-center" style={{ height: totalHeight, width: 12 }}>
        {/* wick — thin line spanning the full height, extending past the body on both ends */}
        <div className="absolute" style={{ width: 1.5, height: totalHeight, background: hex }} />
        {/* body */}
        <div
          className="relative rounded-[1px]"
          style={{ width: 9, height: spec.bodyHeight, background: hex }}
        />
      </div>
    </div>
  );
}

// Thin trend line tracing through the main cluster, like a moving-average
// overlay on a real trading chart. Coordinates mirror MAIN_CLUSTER (converted
// from `right` to `left` for the 0–100 SVG viewBox).
const TREND_POINTS = "62,56 65,50 67,53 70,46 72,42 75,38 77,40 80,32 82,28 85,30 87,22 90,18 92,20 94,12 96,14 98,8";

export default function MarketBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden bg-[#090C12] pointer-events-none"
    >
      {/* Radial gradient blob — top-right, blue/purple, fading to dark */}
      <div
        className="absolute -top-1/3 -right-1/4 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(59,90,230,0.55) 0%, rgba(124,58,237,0.35) 40%, transparent 72%)",
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Candlestick clusters */}
      <div className="absolute inset-0 blur-[1px]">
        {MAIN_CLUSTER.map((spec, i) => (
          <Candle key={`main-${i}`} spec={spec} />
        ))}
        {MINOR_CLUSTER.map((spec, i) => (
          <Candle key={`minor-${i}`} spec={spec} />
        ))}
      </div>

      {/* Trend line through the main cluster */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={TREND_POINTS}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.18}
        />
      </svg>
    </div>
  );
}
