import { StockData } from "./types";
import { EnrichedNewsItem } from "./types";

// Mirrors ChartPoint from fetchChartData — defined here to avoid importing a server-only module on the client
export interface ChartPoint {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TimelineEvent {
  timestamp: Date;    // full date+time — used for sorting
  time: string;       // HH:MM in Israel time — used for display only
  description: string;
  type: "market" | "news" | "price";
  direction?: "up" | "down";
}

/** Format a Date as HH:MM in Israel time */
function formatILTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const h = parseInt(parts.find((p) => p.type === "hour")!.value);
  const m = parseInt(parts.find((p) => p.type === "minute")!.value);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Format a Date as "MM/DD/YYYY" in Israel time — used for day-boundary comparisons */
function dateStringIL(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Return the UTC offset for Asia/Jerusalem (minutes) at a given instant.
 * Handles DST correctly by asking Intl what it reports vs. what UTC says.
 */
function getILOffsetMinutes(at: Date): number {
  const utcTotal = at.getUTCHours() * 60 + at.getUTCMinutes();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const ilTotal =
    parseInt(parts.find((p) => p.type === "hour")!.value) * 60 +
    parseInt(parts.find((p) => p.type === "minute")!.value);
  let offset = ilTotal - utcTotal;
  // Normalise across midnight boundaries (±720 min)
  if (offset > 720) offset -= 1440;
  if (offset < -720) offset += 1440;
  return offset;
}

/**
 * Return Date objects for market open (16:30 IL) and close (23:00 IL)
 * of the most recent trading session.
 *
 * Rule: if the current IL time is before 16:30 the session belongs to the
 * previous calendar day; otherwise it belongs to today.
 *
 * All arithmetic uses the actual IL UTC offset so DST is handled correctly.
 */
function lastSessionTimestamps(): { open: Date; close: Date } {
  const now = new Date();
  const offsetMinutes = getILOffsetMinutes(now);

  // Read current IL date + time in one pass
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const ilYear  = parseInt(parts.find((p) => p.type === "year")!.value);
  const ilMonth = parseInt(parts.find((p) => p.type === "month")!.value); // 1-based
  const ilDay   = parseInt(parts.find((p) => p.type === "day")!.value);
  const ilNowMinutes =
    parseInt(parts.find((p) => p.type === "hour")!.value) * 60 +
    parseInt(parts.find((p) => p.type === "minute")!.value);

  // Before 16:30 IL → session was yesterday; Date.UTC handles month/year rollover
  const MARKET_OPEN_IL = 16 * 60 + 30; // 990
  const sessionMidnightUTC =
    ilNowMinutes < MARKET_OPEN_IL
      ? new Date(Date.UTC(ilYear, ilMonth - 1, ilDay - 1)) // yesterday
      : new Date(Date.UTC(ilYear, ilMonth - 1, ilDay));    // today

  const sy = sessionMidnightUTC.getUTCFullYear();
  const sm = sessionMidnightUTC.getUTCMonth() + 1;
  const sd = sessionMidnightUTC.getUTCDate();

  // UTC = IL − offset  (e.g. IL 16:30 − 180 min = UTC 13:30)
  const open  = new Date(Date.UTC(sy, sm - 1, sd, 16, 30) - offsetMinutes * 60_000);
  const close = new Date(Date.UTC(sy, sm - 1, sd, 23,  0) - offsetMinutes * 60_000);

  return { open, close };
}

export function buildTimeline(
  _stock: StockData,
  news: EnrichedNewsItem[],
  chartData: ChartPoint[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Market open / close — real Date objects for the last active session
  const { open, close } = lastSessionTimestamps();
  events.push({ timestamp: open,  time: formatILTime(open),  description: "השוק נפתח (שעון ישראל)", type: "market" });
  events.push({ timestamp: close, time: formatILTime(close), description: "השוק נסגר (שעון ישראל)", type: "market" });

  // News events — today in IL time only
  const todayIL = dateStringIL(new Date());
  for (const item of news) {
    if (!item.publishedAt) continue;
    const pubDate = new Date(item.publishedAt);
    if (dateStringIL(pubDate) !== todayIL) continue;
    events.push({
      timestamp: pubDate,
      time: formatILTime(pubDate),
      description: item.title_he,
      type: "news",
    });
  }

  // Price events — >1.5% move within consecutive 15-min candles (≤1800 s apart)
  for (let i = 0; i < chartData.length - 1; i++) {
    const a = chartData[i];
    const b = chartData[i + 1];
    if (b.time - a.time > 1800) continue;
    const changePct = ((b.close - a.close) / a.close) * 100;
    if (Math.abs(changePct) < 1.5) continue;
    const date = new Date(b.time * 1000);
    const direction = changePct > 0 ? "up" : "down";
    const verb = direction === "up" ? "עלתה" : "ירדה";
    events.push({
      timestamp: date,
      time: formatILTime(date),
      description: `המניה ${verb} ${Math.abs(changePct).toFixed(1)}% תוך 30 דקות`,
      type: "price",
      direction,
    });
  }

  // Sort by the full UTC timestamp — never by HH:mm string alone
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
