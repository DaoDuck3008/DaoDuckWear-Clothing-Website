"use client";

import React from "react";
import { cn } from "@/utils/cn";

export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] bg-stone-100 rounded-sm" />
      
      <div className="flex flex-col gap-2 px-1">
        {/* Category Skeleton */}
        <div className="h-2 w-16 bg-stone-100 rounded" />
        
        {/* Title Skeleton */}
        <div className="h-4 w-3/4 bg-stone-100 rounded" />
        
        {/* Price Skeleton */}
        <div className="h-4 w-1/4 bg-stone-100 rounded" />
      </div>
    </div>
  );
};

export const ProductFilterSkeleton = () => {
  return (
    <div className="w-full bg-white border-b border-stone-100 animate-pulse">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Category Filter Skeletons */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-stone-50 rounded" />
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sorting and Filter Button Skeletons */}
          <div className="h-8 w-32 bg-stone-50 rounded" />
          <div className="h-8 w-24 bg-stone-50 rounded" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
