# Why Did It Move?

An AI-powered web app that explains why a stock moved today. Enter a ticker symbol and get a plain-language analysis backed by real market data and recent news — in English or Hebrew.

## What it does

1. Fetches live stock quote data (price, change %, volume) from Yahoo Finance.
2. Pulls the last 7 days of company news from Finnhub.
3. Sends everything to Gemini (Google AI) to generate a concise explanation of the price movement, a confidence score, and the key contributing factors.

## Tech stack

- **Next.js 14** (App Router) — frontend + API route
- **@google/generative-ai** — Gemini 1.5 Flash for AI analysis
- **yahoo-finance2** — stock quote data
- **Finnhub API** — company news
- **Tailwind CSS** — styling
- Bilingual: English / Hebrew (RTL support)

## Getting API keys

### Google Gemini

1. Go to [aistudio.google.com](https://aistudio.google.com) and sign in with your Google account.
2. Click **Get API key** → **Create API key**.
3. Copy the key — you'll need it as `GEMINI_API_KEY`.

> A free tier is available with generous rate limits for development use.

### Finnhub

1. Go to [finnhub.io](https://finnhub.io) and create a free account.
2. Your API key is shown on the dashboard under **API Key**.
3. Copy it — you'll need it as `FINNHUB_API_KEY`.

> The free Finnhub tier includes company news endpoints and is sufficient for this app.

## Running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Enter a stock symbol (e.g. `TSLA`, `AAPL`, `NVDA`) and click **Analyze** — or press **Enter**.

## Notes

- Stock data comes from Yahoo Finance via the `yahoo-finance2` library — no API key required.
- Analysis quality depends on how much recent news is available for the stock; low-volume tickers may return a low-confidence result.
- The `/stock/[symbol]` route (e.g. `/stock/TSLA`) renders a shareable server-side page with 5-minute ISR revalidation.
