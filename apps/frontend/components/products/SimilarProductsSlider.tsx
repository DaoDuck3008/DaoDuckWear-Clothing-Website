"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

type SliderProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: { url: string; isMain: boolean }[];
  category?: { name: string };
};

const VISIBLE_LG = 4;
const VISIBLE_MD = 3;
const VISIBLE_SM = 2;
const INTERVAL_MS = 3000;
const TRANSITION_MS = 500;

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="bg-stone-100 w-full aspect-[3/4]" />
      <div className="space-y-2 px-1">
        <div className="bg-stone-100 h-3 w-3/4 rounded" />
        <div className="bg-stone-100 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

function SliderSkeleton() {
  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: VISIBLE_LG }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full bg-stone-100 animate-pulse ${i === 0 ? "w-6" : "w-1.5"}`} />
        ))}
      </div>
    </div>
  );
}

interface SimilarProductsSliderProps {
  products: SliderProduct[];
  isLoading?: boolean;
}

export default function SimilarProductsSlider({
  products,
  isLoading = false,
}: SimilarProductsSliderProps) {
  const n = products.length;

  const extended = [
    ...products.slice(-VISIBLE_LG),
    ...products,
    ...products.slice(0, VISIBLE_LG),
  ];

  const [currentIndex, setCurrentIndex] = useState(VISIBLE_LG);
  const [animated, setAnimated] = useState(true);
  const [itemWidth, setItemWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const visible =
      window.innerWidth >= 1024
        ? VISIBLE_LG
        : window.innerWidth >= 768
          ? VISIBLE_MD
          : VISIBLE_SM;
    setItemWidth(w / visible);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimated(true))
      );
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "transform") return;
    if (currentIndex >= VISIBLE_LG + n) {
      setAnimated(false);
      setCurrentIndex((i) => i - n);
    } else if (currentIndex < VISIBLE_LG) {
      setAnimated(false);
      setCurrentIndex((i) => i + n);
    }
  };

  const next = useCallback(() => setCurrentIndex((i) => i + 1), []);
  const prev = useCallback(() => setCurrentIndex((i) => i - 1), []);

  const startAuto = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, INTERVAL_MS);
  }, [next]);

  const stopAuto = useCallback(() => clearInterval(intervalRef.current), []);

  useEffect(() => {
    if (n > 0) startAuto();
    return stopAuto;
  }, [n, startAuto, stopAuto]);

  if (isLoading) return <SliderSkeleton />;
  if (!n) return null;

  const realIndex = ((currentIndex - VISIBLE_LG) % n + n) % n;

  return (
    <div className="relative">
      <div
        className="relative"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        {/* Left arrow */}
        <button
          onClick={() => { prev(); startAuto(); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white border border-stone-200 shadow-sm flex items-center justify-center hover:border-black hover:bg-stone-50 transition-colors -translate-x-1/2"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Track */}
        <div ref={containerRef} className="overflow-hidden mx-5 sm:mx-6">
          <div
            className="flex"
            style={{
              transform: itemWidth
                ? `translateX(-${currentIndex * itemWidth}px)`
                : undefined,
              transition:
                animated && itemWidth
                  ? `transform ${TRANSITION_MS}ms ease-in-out`
                  : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extended.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                style={itemWidth ? { width: `${itemWidth}px`, flexShrink: 0 } : undefined}
                className={`${itemWidth ? "" : "w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0"} px-1.5 sm:px-2 lg:px-3`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => { next(); startAuto(); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white border border-stone-200 shadow-sm flex items-center justify-center hover:border-black hover:bg-stone-50 transition-colors translate-x-1/2"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setAnimated(true);
              setCurrentIndex(VISIBLE_LG + i);
              startAuto();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              realIndex === i ? "w-6 bg-black" : "w-1.5 bg-stone-300"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
