function CardSkeleton() {
  return (
    <div className="flex items-start gap-4 bg-gray-900 rounded-2xl p-4 border border-gray-800 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-gray-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-800 rounded" />
      </div>
      <div className="space-y-2 shrink-0 text-right">
        <div className="h-4 w-14 bg-gray-800 rounded ms-auto" />
        <div className="h-3 w-10 bg-gray-800 rounded ms-auto" />
      </div>
    </div>
  );
}

export default function MoversLoading() {
  return (
    <div dir="rtl" className="min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-32 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-11 flex-1 bg-gray-800 rounded-xl animate-pulse" />
        </div>

        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
