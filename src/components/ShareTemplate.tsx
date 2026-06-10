import { forwardRef } from "react";

interface Props {
  symbol: string;
  companyName: string;
  oneLiner: string;
  confidence: number;
  confidenceLevel: "high" | "medium" | "low";
  changePercent: number;
  heatScore: number;
}

const ShareTemplate = forwardRef<HTMLDivElement, Props>(function ShareTemplate(
  { symbol, companyName, oneLiner, confidence, confidenceLevel, changePercent, heatScore },
  ref
) {
  const sign = changePercent >= 0 ? "+" : "";
  const changeColor = changePercent >= 0 ? "#10b981" : "#ef4444";
  const confColor =
    confidenceLevel === "high" ? "#10b981" : confidenceLevel === "medium" ? "#f59e0b" : "#94a3b8";
  const confLabel =
    confidenceLevel === "high" ? "גבוה" : confidenceLevel === "medium" ? "בינוני" : "נמוך";
  const heatColor =
    heatScore >= 80 ? "#f87171" : heatScore >= 60 ? "#fb923c" : heatScore >= 40 ? "#facc15" : "#94a3b8";

  const confBarWidth = `${Math.min(confidence, 100)}%`;

  return (
    <div
      ref={ref}
      dir="rtl"
      style={{
        width: "600px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, 'Noto Sans Hebrew', sans-serif",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0d1f3f 100%)",
        borderRadius: "20px",
        border: "1px solid rgba(59,130,246,0.25)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span style={{ fontSize: "13px", color: "#64748b", letterSpacing: "0.05em" }}>
          📊 ניתוח AI · MoveIQ
        </span>
        <span style={{ fontSize: "11px", color: "#475569" }}>move-iq-one.vercel.app</span>
      </div>

      {/* Main content */}
      <div style={{ padding: "28px 28px 24px" }}>
        {/* Symbol + change row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "800",
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {symbol}
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
              {companyName}
            </div>
          </div>

          {/* Right side: change + heat */}
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: changeColor,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {sign}{changePercent.toFixed(2)}%
            </span>
            <span style={{ fontSize: "13px", color: heatColor, textAlign: "left" }}>
              🔥 Heat {heatScore}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.08)",
            margin: "20px 0",
          }}
        />

        {/* oneLiner */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#e2e8f0",
            lineHeight: "1.5",
            marginBottom: "24px",
          }}
        >
          🎯 {oneLiner}
        </div>

        {/* Confidence bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b" }}>רמת ביטחון</span>
            <span style={{ fontSize: "12px", color: confColor, fontWeight: "600" }}>
              {confidence}% · {confLabel}
            </span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "99px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: confBarWidth,
                background: confColor,
                borderRadius: "99px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 28px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "11px", color: "#334155" }}>
          Generated by MoveIQ AI Analysis
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "#3b82f6",
            letterSpacing: "-0.01em",
          }}
        >
          MoveIQ ✦
        </span>
      </div>
    </div>
  );
});

export default ShareTemplate;
