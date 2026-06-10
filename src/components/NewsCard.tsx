import { NewsItem } from "@/lib/types";

interface Props {
  news: NewsItem;
  language: "he" | "en";
}

export default function NewsCard({ news, language }: Props) {
  const dir = language === "he" ? "rtl" : "ltr";

  const date = new Date(news.publishedAt).toLocaleDateString(
    language === "he" ? "he-IL" : "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const sentimentDot: Record<NonNullable<NewsItem["sentiment"]>, string> = {
    positive: "bg-green-400",
    negative: "bg-red-400",
    neutral: "bg-gray-500",
  };

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      dir={dir}
      className="block bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {news.sentiment && (
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${sentimentDot[news.sentiment]}`}
            />
          )}
          <span className="text-xs font-medium text-blue-400">{news.source}</span>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0">{date}</span>
      </div>
      <p className="text-white font-medium leading-snug line-clamp-2">{news.title}</p>
      {news.summary && (
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{news.summary}</p>
      )}
    </a>
  );
}
