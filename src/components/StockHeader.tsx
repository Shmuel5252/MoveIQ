import { StockData } from "@/lib/types";

interface Props {
  stock: StockData;
  language: "he" | "en";
}

export default function StockHeader({ stock, language }: Props) {
  const dir = language === "he" ? "rtl" : "ltr";
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-green-400" : "text-red-400";
  const changeSign = isPositive ? "+" : "";

  return (
    <div dir={dir} className="bg-gray-900 rounded-2xl p-5 sm:p-6 space-y-1">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="font-mono tracking-widest">{stock.symbol}</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
        {stock.companyName}
      </h1>
      <div className="flex items-baseline gap-3 pt-1 flex-wrap">
        <span className="text-4xl sm:text-5xl font-bold text-white">
          ${stock.price.toFixed(2)}
        </span>
        <span className={`text-lg font-semibold ${changeColor}`}>
          {changeSign}
          {stock.change.toFixed(2)} ({changeSign}
          {stock.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
