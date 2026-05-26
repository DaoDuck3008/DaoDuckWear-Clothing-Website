"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Review } from "@/types/review";
import { reviewApi } from "@/apis/review.api";
import { handleApiError } from "@/utils/error.util";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onSuccess: (review: Review) => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmitting(true);
    try {
      let result: Review;
      if (isEdit) {
        result = await reviewApi.updateReview(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });
      } else {
        result = await reviewApi.createReview({
          productId,
          rating,
          comment: comment.trim() || undefined,
        });
      }
      toast.success(isEdit ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá thành công");
      onSuccess(result);
    } catch (err) {
      handleApiError(err, isEdit ? "Không thể cập nhật đánh giá" : "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="py-6 border-b border-stone-100 animate-in fade-in duration-300"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-4">
        {isEdit ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}
      </p>

      {/* Star picker */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-[0.15em] text-stone-500 block mb-2">
          Đánh giá chất lượng
        </label>
        <StarRating
          rating={rating}
          size="md"
          interactive
          onChange={setRating}
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-stone-500 block mb-2">
          Nhận xét (tùy chọn)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          className="w-full bg-transparent border-b border-stone-200 py-2 px-0 text-sm text-black placeholder:text-stone-300 focus:border-black focus:outline-none transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white px-6 h-9 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
          {isEdit ? "Lưu thay đổi" : "Gửi đánh giá"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-black transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
