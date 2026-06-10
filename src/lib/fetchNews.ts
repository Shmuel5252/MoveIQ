import axios from "axios";
import { NewsItem } from "./types";

// ── XML helpers (regex-based; no DOMParser in Node.js runtime) ──────────────

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // unwrap CDATA
    .replace(/<[^>]+>/g, "")                        // strip any inner HTML
    .trim();
}

function parseRSSItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link  = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");

    if (!title || !link) continue;

    let publishedAt: string;
    try {
      publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    } catch {
      publishedAt = new Date().toISOString();
    }

    items.push({
      title,
      summary: description,
      url: link,
      source: "Yahoo Finance",
      publishedAt,
    });
  }
  return items;
}

// ── Individual source fetchers ───────────────────────────────────────────────

async function fetchFinnhub(symbol: string): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const res = await axios.get<FinnhubArticle[]>(
    "https://finnhub.io/api/v1/company-news",
    {
      params: {
        symbol: symbol.toUpperCase(),
        from: fmt(from),
        to: fmt(to),
        token: apiKey,
      },
    }
  );

  if (!Array.isArray(res.data) || res.data.length === 0) return [];

  return res.data.map((item) => ({
    title: item.headline,
    summary: item.summary ?? "",
    url: item.url,
    source: item.source,
    publishedAt: new Date(item.datetime * 1000).toISOString(),
  }));
}

async function fetchYahooRSS(symbol: string): Promise<NewsItem[]> {
  const url =
    `https://feeds.finance.yahoo.com/rss/2.0/headline` +
    `?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`;

  const res = await axios.get<string>(url, {
    responseType: "text",
    timeout: 8000,
  });

  return parseRSSItems(res.data);
}

// ── Public export ────────────────────────────────────────────────────────────

export default async function fetchNews(symbol: string): Promise<NewsItem[]> {
  const [finnhubResult, rssResult] = await Promise.allSettled([
    fetchFinnhub(symbol),
    fetchYahooRSS(symbol),
  ]);

  // Finnhub first so its items win deduplication (richer metadata)
  const all: NewsItem[] = [
    ...(finnhubResult.status === "fulfilled" ? finnhubResult.value : []),
    ...(rssResult.status    === "fulfilled" ? rssResult.value    : []),
  ];

  // Deduplicate: first 40 chars of title, case-insensitive
  const seen = new Set<string>();
  const deduped = all.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Most recent first, cap at 15
  const articles = deduped
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 15);

  process.stdout.write(`[fetchNews] ${symbol} total articles: ${articles.length}\n`);
  return articles;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface FinnhubArticle {
  headline: string;
  summary?: string;
  url: string;
  source: string;
  datetime: number;
}
