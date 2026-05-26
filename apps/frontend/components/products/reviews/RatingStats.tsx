import { RatingStats as RatingStatsType } from "@/types/review";
import StarRating from "./StarRating";

interface RatingStatsProps {
  stats: RatingStatsType;
}

export default function RatingStats({ stats }: RatingStatsProps) {
  const { averageRating, totalCount, distribution } = stats;

  return (
    <div className="flex flex-col sm:flex-row gap-8 py-8 border-b border-stone-100">
      {/* Left: average score */}
      <div className="flex flex-col items-center justify-center min-w-[120px] gap-2">
        <span className="font-cormorant text-5xl font-bold text-black leading-none">
          {averageRating > 0 ? averageRating.toFixed(1) : "—"}
        </span>
        <StarRating rating={Math.round(averageRating)} size="sm" />
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
          {totalCount} đánh giá
        </span>
      </div>

      {/* Right: distribution bars */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;
          const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider w-8 text-right shrink-0">
                {star} ★
              </span>
              <div className="flex-1 h-1 bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-editorial-accent transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-400 w-6 text-right shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
