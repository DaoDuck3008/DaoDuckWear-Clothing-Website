"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { toast } from "react-toastify";
import { Review, RatingStats, ReviewsResponse } from "@/types/review";
import { reviewApi } from "@/apis/review.api";
import { useAuthStore } from "@/stores/auth.store";
import { handleApiError } from "@/utils/error.util";
import RatingStatsComponent from "./RatingStats";
import ReviewCard from "./ReviewCard";
import ReviewSectionSkeleton from "./ReviewSectionSkeleton";

interface ReviewSectionProps {
  productId: string;
  onStatsLoaded?: (stats: RatingStats) => void;
}

const LIMIT = 5;

export default function ReviewSection({
  productId,
  onStatsLoaded,
}: ReviewSectionProps) {
  const user = useAuthStore((state) => state.user);

  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Lazy-load: chỉ fetch khi section vào viewport
  useEffect(() => {
    if (!inView) return;
    fetchInitialData();
  }, [inView, productId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsData, reviewsData]: [RatingStats, ReviewsResponse] =
        await Promise.all([
          reviewApi.getProductRatingStats(productId),
          reviewApi.getProductReviews(productId, 1, LIMIT),
        ]);

      setStats(statsData);
      onStatsLoaded?.(statsData);
      setReviews(reviewsData.reviews);
      setTotalPages(reviewsData.totalPages);
      setPage(1);

      if (user) {
        const mine = reviewsData.reviews.find((r) => r.userId?.id === user.id);
        setUserReview(mine ?? null);
      }
    } catch {
      // silent — section sẽ hiển thị trạng thái rỗng
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const data: ReviewsResponse = await reviewApi.getProductReviews(
        productId,
        page + 1,
        LIMIT,
      );
      setReviews((prev) => [...prev, ...data.reviews]);
      setPage((p) => p + 1);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReviewUpdated = (updated: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r._id === updated._id ? updated : r)),
    );
    setUserReview(updated);
  };

  const handleReviewDeleted = async (id: string) => {
    try {
      await reviewApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setUserReview(null);
      toast.success("Đã xóa đánh giá");
      // Cập nhật stats
      if (stats) {
        const deleted = reviews.find((r) => r._id === id);
        if (deleted) {
          const newTotal = Math.max(0, stats.totalCount - 1);
          const newAvg =
            newTotal === 0
              ? 0
              : Math.round(
                  ((stats.averageRating * stats.totalCount - deleted.rating) /
                    newTotal) *
                    10,
                ) / 10;
          const newStats = {
            ...stats,
            totalCount: newTotal,
            averageRating: newAvg,
            distribution: {
              ...stats.distribution,
              [deleted.rating]: Math.max(
                0,
                (stats.distribution[deleted.rating] ?? 1) - 1,
              ),
            },
          };
          setStats(newStats);
          onStatsLoaded?.(newStats);
        }
      }
    } catch (err) {
      handleApiError(err, "Không thể xóa đánh giá");
    }
  };

  return (
    <div ref={ref} className="mt-20 max-w-4xl mx-auto px-4">
      <h2 className="font-cormorant text-xl lg:text-2xl font-bold tracking-tighter uppercase mb-2">
        Đánh giá sản phẩm
      </h2>

      {!inView || loading ? (
        <ReviewSectionSkeleton />
      ) : (
        <>
          {/* Stats */}
          {stats && <RatingStatsComponent stats={stats} />}

          {/* Write review prompt */}
          <div className="mt-6">
            {!userReview && (
              <p className="text-[11px] text-stone-400 py-4">
                Đã mua sản phẩm?{" "}
                <Link
                  href="/profile/orders"
                  className="font-bold text-black underline underline-offset-2 hover:text-editorial-accent transition-colors"
                >
                  Vào đơn hàng
                </Link>{" "}
                để viết đánh giá.
              </p>
            )}
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-[11px] text-stone-400 py-8 uppercase tracking-widest font-bold text-center">
              Chưa có đánh giá nào.
            </p>
          ) : (
            <div className="mt-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={user?.id}
                  productId={productId}
                  onUpdated={handleReviewUpdated}
                  onDeleted={handleReviewDeleted}
                />
              ))}

              {page < totalPages && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="border border-stone-200 px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-black transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Đang tải..." : "Xem thêm đánh giá"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
