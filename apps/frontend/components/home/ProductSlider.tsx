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

const VISIBLE_LG = 4;   // ≥ 1024px
const VISIBLE_MD = 3;   // ≥ 768px
const VISIBLE_SM = 2;   // < 768px
const INTERVAL_MS = 3000;
const TRANSITION_MS = 500;

interface ProductSliderSectionProps {
  title: string;
  products: SliderProduct[];
  viewAllHref?: string;
}

export const ProductSliderSection = ({
  title,
  products,
  viewAllHref = "#",
}: ProductSliderSectionProps) => {
  const n = products.length;

  // Clone VISIBLE_LG items at both ends for seamless infinite loop
  const extended = [
    ...products.slice(-VISIBLE_LG),  // start clones (backward wrap)
    ...products,                       // real items
    ...products.slice(0, VISIBLE_LG), // end clones (forward wrap)
  ];

  const [currentIndex, setCurrentIndex] = useState(VISIBLE_LG);
  const [animated, setAnimated] = useState(true);
  const [itemWidth, setItemWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isAnimatingRef = useRef(false);

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

  // Re-enable animation one frame after a silent index reset
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
    isAnimatingRef.current = false;
  };

  // Safety net: whenever currentIndex drifts out of the safe range
  // (e.g. ticks fired while tab was hidden and transitionend never ran),
  // snap it back to the equivalent real index without animation.
  useEffect(() => {
    if (n <= 0) return;
    if (currentIndex >= VISIBLE_LG + n || currentIndex < VISIBLE_LG) {
      const wrapped = ((currentIndex - VISIBLE_LG) % n + n) % n + VISIBLE_LG;
      if (wrapped !== currentIndex) {
        setAnimated(false);
        setCurrentIndex(wrapped);
        isAnimatingRef.current = false;
      }
    }
  }, [currentIndex, n]);

  const next = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setAnimated(true);
    setCurrentIndex((i) => i + 1);
  }, []);
  const prev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setAnimated(true);
    setCurrentIndex((i) => i - 1);
  }, []);

  const startAuto = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, INTERVAL_MS);
  }, [next]);

  const stopAuto = useCallback(() => clearInterval(intervalRef.current), []);

  useEffect(() => {
    if (n > 0) startAuto();
    return stopAuto;
  }, [n, startAuto, stopAuto]);

  // Pause autoplay when tab is hidden so currentIndex can't drift past
  // the wrap-around boundary while CSS transitions are frozen.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopAuto();
      else if (n > 0) startAuto();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [n, startAuto, stopAuto]);

  if (!n) return null;

  const realIndex = ((currentIndex - VISIBLE_LG) % n + n) % n;

  return (
    <section className="max-w-screen mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16 mb-6 lg:mb-12 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h2 className="font-cormorant text-xl sm:text-2xl font-bold tracking-tighter uppercase">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => { prev(); startAuto(); }}
            onMouseEnter={stopAuto}
            onMouseLeave={startAuto}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-stone-200 rounded-full flex items-center justify-center hover:border-black hover:bg-stone-50 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => { next(); startAuto(); }}
            onMouseEnter={stopAuto}
            onMouseLeave={startAuto}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-stone-200 rounded-full flex items-center justify-center hover:border-black hover:bg-stone-50 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider track */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
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

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (isAnimatingRef.current) return;
              isAnimatingRef.current = true;
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

      {/* View all */}
      <div className="mt-6 sm:mt-8 border-b border-stone-200 pb-8 sm:pb-12">
        <a
          href={viewAllHref}
          className="inline-block border border-stone-300 px-6 py-2 text-[11px] font-medium uppercase tracking-widest hover:border-black transition-colors"
        >
          Xem tất cả
        </a>
      </div>
    </section>
  );
};
