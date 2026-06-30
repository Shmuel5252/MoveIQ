// Standalone sync script — NOT an API route. Run manually/on a schedule
// (weekly/monthly) to refresh sector classification for the S&P 500:
//
//   npm run sync:sectors
//
// To re-sync only specific symbols (e.g. ones that failed last run):
//
//   npm run sync:sectors -- AAPL MSFT NVDA
//
// It is intentionally slow (rate-limited) and not part of the request path.

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import YahooFinance from "yahoo-finance2";
import { sp500List } from "../src/lib/sp500List";

// .env.local isn't auto-loaded outside the Next.js runtime — parse it manually.
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}
loadEnvLocal();

const DELAY_MS = 400;
const MAX_RETRIES = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        const backoff = 500 * attempt;
        console.log(`  retry ${attempt}/${MAX_RETRIES} for ${label} after ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined (.env.local)");

  const client = new MongoClient(uri);
  await withRetry(() => client.connect(), "mongo connect");
  const col = client.db().collection("sectorMapping");
  await col.createIndex({ symbol: 1 }, { unique: true });

  const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

  const onlySymbols = process.argv.slice(2);
  const targets =
    onlySymbols.length > 0
      ? sp500List.filter((s) => onlySymbols.includes(s.symbol))
      : sp500List;

  if (onlySymbols.length > 0) {
    console.log(`Targeted re-sync: ${targets.length}/${onlySymbols.length} requested symbols found in sp500List.`);
  }

  let synced = 0;
  let failed = 0;
  const failedSymbols: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const { symbol, name } = targets[i];

    try {
      const summary = await withRetry(
        () => yf.quoteSummary(symbol, { modules: ["assetProfile"] }),
        symbol
      );
      const profile = summary?.assetProfile;

      if (!profile?.sector) {
        failed++;
        failedSymbols.push(symbol);
        console.log(`[${i + 1}/${targets.length}] ${symbol} — no sector data, skipped`);
      } else {
        await col.updateOne(
          { symbol },
          {
            $set: {
              symbol,
              companyName: name,
              sector: profile.sector,
              industry: profile.industry ?? "",
              lastSynced: new Date(),
            },
          },
          { upsert: true }
        );
        synced++;
        if ((i + 1) % 25 === 0) {
          console.log(`[${i + 1}/${targets.length}] synced so far: ${synced}, failed: ${failed}`);
        }
      }
    } catch (err) {
      failed++;
      failedSymbols.push(symbol);
      console.log(`[${i + 1}/${targets.length}] ${symbol} — error: ${String(err)}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Synced ${synced}/${targets.length}, failed ${failed}.`);
  if (failedSymbols.length > 0) {
    console.log("Failed symbols:", failedSymbols.join(", "));
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
