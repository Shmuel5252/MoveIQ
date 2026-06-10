export default function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* StockHeader skeleton */}
      <div className="bg-gray-900 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="h-3.5 w-14 bg-gray-700 rounded" />
        <div className="h-6 w-44 bg-gray-700 rounded" />
        <div className="flex items-baseline gap-3 pt-1">
          <div className="h-12 w-36 bg-gray-700 rounded" />
          <div className="h-6 w-24 bg-gray-700 rounded" />
        </div>
      </div>

      {/* AnalysisCard skeleton */}
      <div className="bg-gray-900 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-28 bg-gray-700 rounded" />
          <div className="h-6 w-24 bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-gray-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-700 rounded" />
          <div className="h-4 w-2/3 bg-gray-700 rounded" />
        </div>
        <div className="space-y-3 pt-1">
          <div className="h-3.5 w-24 bg-gray-700 rounded" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3.5 w-32 bg-gray-700 rounded" />
                <div className="h-3.5 w-10 bg-gray-700 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* News skeleton */}
      <div className="space-y-3">
        <div className="h-3.5 w-28 bg-gray-700 rounded" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-700 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-4 w-4/5 bg-gray-700 rounded" />
            <div className="h-3.5 w-3/5 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
