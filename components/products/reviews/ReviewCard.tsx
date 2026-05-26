"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Review } from "@/types/review";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  productId: string;
  onUpdated: (updated: Review) => void;
  onDeleted: (id: string) => void;
}

export default function ReviewCard({
  review,
  currentUserId,
  productId,
  onUpdated,
  onDeleted,
}: ReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const isOwner = currentUserId === review.userId?.id;

  const initials = review.userId?.username
    ? review.userId.username.slice(0, 2).toUpperCase()
    : "?";

  const formattedDate = new Date(review.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (editing) {
    return (
      <ReviewForm
        productId={productId}
        existingReview={review}
        onSuccess={(updated) => {
          onUpdated(updated);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="py-6 border-b border-stone-100 last:border-0 animate-in fade-in duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center">
          {review.userId?.avatar ? (
            <img
              src={review.userId.avatar}
              alt={review.userId.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-bold text-stone-500">
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-black uppercase tracking-wide">
                {review.userId?.username || "Người dùng"}
              </span>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="text-stone-400 hover:text-black transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleted(review.id)}
                  className="text-stone-400 hover:text-editorial-accent transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Stars + date */}
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} size="xs" />
            <span className="text-[10px] text-stone-400 tracking-wide">
              {formattedDate}
            </span>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-stone-600 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
