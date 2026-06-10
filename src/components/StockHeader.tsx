import { StockData } from "@/lib/types";

interface Props {
  stock: StockData;
  language: "he" | "en";
}

export default function StockHeader({ stock, language }: Props) {
  const dir = language === "he" ? "rtl" : "ltr";
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
  const changeSign = isPositive ? "+" : "";

  return (
    <div
      dir={dir}
      className="flex items-center justify-between bg-gray-900 rounded-xl px-4 h-14"
    >
      {/* Right side (RTL start): symbol + company name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono tracking-widest text-gray-400 shrink-0">
          {stock.symbol}
        </span>
        <span className="text-sm font-medium text-white truncate">
          {stock.companyName}
        </span>
      </div>

      {/* Left side (RTL end): price + change — always LTR */}
      <div dir="ltr" className="flex items-baseline gap-1.5 shrink-0 text-left">
        <span className="text-sm font-semibold text-white tabular-nums">
          ${stock.price.toFixed(2)}
        </span>
        <span className={`text-xs font-medium tabular-nums ${changeColor}`}>
          {changeSign}{stock.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
