"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { orderApi } from "@/apis/order.api";
import { reviewApi } from "@/apis/review.api";
import { useAuthStore } from "@/stores/auth.store";
import { Review } from "@/types/review";
import { handleApiError } from "@/utils/error.util";
import { toast } from "react-toastify";
import ReviewForm from "@/components/products/reviews/ReviewForm";
import ReviewCard from "@/components/products/reviews/ReviewCard";

interface ProductReviewState {
  productId: string;
  name: string;
  image?: string;
  color: string;
  size: string;
  review: Review | null;
}

export default function OrderReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductReviewState[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await orderApi.getOrder(id as string);
        const order = res.data;

        if (order.status !== "COMPLETED") {
          router.replace(`/profile/orders/${id}`);
          return;
        }

        // Deduplicate by productId
        const seen = new Set<string>();
        const uniqueItems: any[] = [];
        for (const item of order.items) {
          if (!seen.has(item.productId)) {
            seen.add(item.productId);
            uniqueItems.push(item);
          }
        }

        // Fetch user's existing reviews for each product in parallel
        const reviews = await Promise.all(
          uniqueItems.map((item) =>
            reviewApi.getMyReview(item.productId).catch(() => null),
          ),
        );

        setProducts(
          uniqueItems.map((item, i) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            color: item.color,
            size: item.size,
            review: reviews[i] ?? null,
          })),
        );
      } catch (err) {
        handleApiError(err, "Không thể tải đơn hàng");
        router.replace("/profile/orders");
      } finally {
        setLoading(false);
      }
    };

    if (id) init();
  }, [id, router]);

  const handleReviewSuccess = (productId: string, review: Review) => {
    setProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, review } : p)),
    );
  };

  const handleReviewUpdated = (productId: string, review: Review) => {
    setProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, review } : p)),
    );
  };

  const handleReviewDeleted = async (reviewId: string, productId: string) => {
    try {
      await reviewApi.deleteReview(reviewId);
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId ? { ...p, review: null } : p,
        ),
      );
      toast.success("Đã xóa đánh giá");
    } catch (err) {
      handleApiError(err, "Không thể xóa đánh giá");
    }
  };

  const allReviewed = products.length > 0 && products.every((p) => p.review);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          Đang tải...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          href={`/profile/orders/${id}`}
          className="p-3 bg-stone-50 hover:bg-black hover:text-white rounded-2xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">
            Đánh giá sản phẩm
          </h2>
          <p className="text-sm text-stone-400 font-medium mt-1">
            Chia sẻ trải nghiệm của bạn với sản phẩm đã mua
          </p>
        </div>
      </div>

      {/* All reviewed state */}
      {allReviewed && (
        <div className="mb-10 bg-emerald-50 border border-emerald-100 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <p className="font-black text-lg uppercase tracking-tight text-black">
            Cảm ơn bạn đã đánh giá!
          </p>
          <p className="text-sm text-stone-500">
            Phản hồi của bạn giúp chúng tôi cải thiện sản phẩm và hỗ trợ
            khách hàng khác lựa chọn tốt hơn.
          </p>
          <Link
            href="/profile/orders"
            className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black underline underline-offset-2 hover:text-editorial-accent transition-colors"
          >
            Quay về đơn hàng
          </Link>
        </div>
      )}

      {/* Product list */}
      <div className="space-y-8">
        {products.map((p) => (
          <div
            key={p.productId}
            className="bg-white border border-stone-100 rounded-2xl overflow-hidden"
          >
            {/* Product info */}
            <div className="p-6 flex gap-4 items-start border-b border-stone-50">
              {p.image && (
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight text-black">
                  {p.name}
                </h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                  {p.color} · {p.size}
                </p>
              </div>
            </div>

            {/* Review area */}
            <div className="px-6">
              {p.review ? (
                <ReviewCard
                  review={p.review}
                  currentUserId={user?.id}
                  productId={p.productId}
                  onUpdated={(updated) =>
                    handleReviewUpdated(p.productId, updated)
                  }
                  onDeleted={(reviewId) =>
                    handleReviewDeleted(reviewId, p.productId)
                  }
                />
              ) : (
                <ReviewForm
                  productId={p.productId}
                  onSuccess={(review) =>
                    handleReviewSuccess(p.productId, review)
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
