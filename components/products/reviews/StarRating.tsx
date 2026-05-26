"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "xs" | "sm" | "md";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  xs: "w-2.5 h-2.5",
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
};

export default function StarRating({
  rating,
  max = 5,
  size = "sm",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const displayed = interactive ? (hovered || rating) : rating;

  return (
    <div
      className={cn("flex items-center gap-0.5", interactive && "cursor-pointer")}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < displayed;
        return (
          <Star
            key={i}
            className={cn(
              sizeMap[size],
              "transition-colors duration-150",
              filled
                ? "text-editorial-accent fill-editorial-accent"
                : "text-stone-200 fill-stone-200",
              interactive && "hover:text-editorial-accent hover:fill-editorial-accent",
            )}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </div>
  );
}
