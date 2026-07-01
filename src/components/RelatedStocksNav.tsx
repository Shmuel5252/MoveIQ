"use client";

import { useRouter } from "next/navigation";
import RelatedStocks from "./RelatedStocks";

export default function RelatedStocksNav({ symbols }: { symbols: string[] }) {
  const router = useRouter();
  if (!symbols.length) return null;
  return <RelatedStocks symbols={symbols} onSearch={(sym) => router.push(`/stock/${sym}`)} />;
}
