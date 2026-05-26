export default function ReviewSectionSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats skeleton */}
      <div className="flex flex-col sm:flex-row gap-8 py-8 border-b border-stone-100">
        <div className="flex flex-col items-center justify-center min-w-[120px] gap-2">
          <div className="w-16 h-12 bg-stone-100 rounded-sm" />
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-3.5 h-3.5 bg-stone-100 rounded-sm" />
            ))}
          </div>
          <div className="w-20 h-3 bg-stone-100 rounded-sm" />
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className="w-8 h-3 bg-stone-100 rounded-sm" />
              <div className="flex-1 h-1 bg-stone-100 rounded-sm" />
              <div className="w-4 h-3 bg-stone-100 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Review cards skeleton */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="py-6 border-b border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 shrink-0 bg-stone-100" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-24 h-3 bg-stone-100 rounded-sm" />
                <div className="w-20 h-4 bg-stone-100 rounded-sm" />
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} className="w-2.5 h-2.5 bg-stone-100 rounded-sm" />
                ))}
              </div>
              <div className="w-3/4 h-3 bg-stone-100 rounded-sm" />
              <div className="w-1/2 h-3 bg-stone-100 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
