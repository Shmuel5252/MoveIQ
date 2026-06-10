"use client";

import { useState, useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type Time,
} from "lightweight-charts";

interface ChartPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

type ChartType = "area" | "candle";

interface Props {
  symbol: string;
  changePercent: number;
}

const PERIODS = [
  { label: "יום",  interval: "15m", range: "1d"  },
  { label: "שבוע", interval: "1h",  range: "5d"  },
  { label: "חודש", interval: "1d",  range: "1mo" },
  { label: "שנה",  interval: "1wk", range: "1y"  },
] as const;

const CHART_BG   = "#111827"; // gray-900
const GRID_COLOR = "#1f2937"; // gray-800
const AXIS_COLOR = "#374151"; // gray-700

// ── Helpers ───────────────────────────────────────────────────────────────────

function applySeriesData(
  series: ISeriesApi<"Candlestick", Time> | ISeriesApi<"Area", Time>,
  data: ChartPoint[],
  chartType: ChartType,
) {
  if (chartType === "candle") {
    (series as ISeriesApi<"Candlestick", Time>).setData(
      data.map((d) => ({
        time: d.time as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })),
    );
  } else {
    (series as ISeriesApi<"Area", Time>).setData(
      data.map((d) => ({ time: d.time as UTCTimestamp, value: d.close })),
    );
  }
}

function ChartSkeleton() {
  return (
    <div className="h-[200px] w-full rounded-lg bg-gray-800 animate-pulse flex items-end gap-px px-2 pb-2">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-700 rounded-sm"
          style={{ height: `${35 + Math.sin(i * 0.45) * 22 + (i % 3) * 5}%` }}
        />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriceChart({ symbol, changePercent }: Props) {
  const [activePeriod, setActivePeriod] = useState(0);
  const [chartType, setChartType] = useState<ChartType>("area");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick", Time> | ISeriesApi<"Area", Time> | null>(null);

  // Keep a ref to latest data so Effect B can apply it without listing `data` as a dep
  const latestDataRef = useRef<ChartPoint[]>([]);
  latestDataRef.current = data;

  // ── Effect A: create chart once on mount ─────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: CHART_BG },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: GRID_COLOR },
        horzLines: { color: GRID_COLOR },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#6b7280", labelBackgroundColor: "#374151" },
        horzLine: { color: "#6b7280", labelBackgroundColor: "#374151" },
      },
      rightPriceScale: { borderColor: AXIS_COLOR },
      timeScale: {
        borderColor: AXIS_COLOR,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 8,
        minBarSpacing: 4,
      },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect B: swap series when chartType changes ──────────────────────────

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove old series
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    // Create new series
    const series =
      chartType === "candle"
        ? chart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
          })
        : chart.addSeries(AreaSeries, {
            lineColor: "#3b82f6",
            topColor: "rgba(59,130,246,0.25)",
            bottomColor: "rgba(59,130,246,0)",
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
          });

    seriesRef.current = series as ISeriesApi<"Candlestick", Time> | ISeriesApi<"Area", Time>;

    // Re-apply current data to the freshly created series
    if (latestDataRef.current.length > 0) {
      applySeriesData(seriesRef.current, latestDataRef.current, chartType);
      chart.timeScale().fitContent();
    }
  }, [chartType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect C: push new data into existing series ──────────────────────────

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || data.length === 0) return;
    applySeriesData(seriesRef.current, data, chartType);
    chartRef.current.timeScale().fitContent();
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect D: fetch data when period or symbol changes ───────────────────

  useEffect(() => {
    const { interval, range } = PERIODS[activePeriod];
    setLoading(true);
    setError(false);
    setData([]);

    fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&interval=${interval}&range=${range}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((points: ChartPoint[]) => {
        setData(points);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [symbol, activePeriod]);

  const isUp = changePercent >= 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-900 rounded-2xl p-5 sm:p-6 space-y-3">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Period buttons */}
        <div className="flex gap-1">
          {PERIODS.map((p, i) => (
            <button
              key={p.range}
              onClick={() => setActivePeriod(i)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                i === activePeriod
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div className="flex items-center bg-gray-800 rounded-lg p-0.5 text-xs font-medium shrink-0">
          <button
            onClick={() => setChartType("area")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              chartType === "area" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            קו
          </button>
          <span className="text-gray-600 select-none px-0.5">|</span>
          <button
            onClick={() => setChartType("candle")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              chartType === "candle" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            נרות
          </button>
        </div>
      </div>

      {/* Chart wrapper — container div always in DOM so chart can initialize */}
      <div className="relative">
        {/* Loading skeleton overlaid above the chart container */}
        {loading && (
          <div className="absolute inset-0 z-10">
            <ChartSkeleton />
          </div>
        )}
        {/* Error / empty state overlaid */}
        {!loading && (error || data.length === 0) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111827] rounded-lg">
            <span className="text-gray-600 text-sm">אין נתונים זמינים</span>
          </div>
        )}
        {/* Colored top-border accent — green or red based on day change */}
        <div
          className="absolute top-0 left-0 right-0 h-px z-20 rounded-t-sm"
          style={{ background: isUp ? "#26a69a" : "#ef5350", opacity: loading ? 0 : 1 }}
        />
        {/* lightweight-charts mount point */}
        <div ref={containerRef} className="h-[200px] w-full" />
      </div>

      {/* Interaction hint */}
      <p className="text-center text-gray-600 text-xs select-none">
        גלגל עכבר להתקרב&nbsp;&nbsp;|&nbsp;&nbsp;גרור להזזה
      </p>
    </div>
  );
}
