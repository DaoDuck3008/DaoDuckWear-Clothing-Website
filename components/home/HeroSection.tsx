"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bannerApi } from "@/apis/banner.api";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=2071&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
];

interface Slide {
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  title?: string;
}

const DAODUCKWEARHero = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    bannerApi
      .getBanners({ page: "home", position: "hero", isActive: true })
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : data?.data ?? [];
        if (list.length > 0) {
          setSlides(
            list.map((b) => ({
              imageUrl: b.imageUrl,
              mobileImageUrl: b.mobileImageUrl ?? null,
              linkUrl: b.linkUrl ?? null,
              title: b.title,
            })),
          );
        } else {
          setSlides(FALLBACK_IMAGES.map((url) => ({ imageUrl: url })));
        }
      })
      .catch(() => {
        setSlides(FALLBACK_IMAGES.map((url) => ({ imageUrl: url })));
      });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative min-h-[80vh] lg:min-h-screen bg-stone-100 pt-20 lg:pt-32" />
    );
  }

  return (
    <section className="relative min-h-[60vh] lg:min-h-[80vh] overflow-hidden bg-stone-900">
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const inner = (
          <>
            {/* Desktop image */}
            <img
              src={slide.imageUrl}
              alt={slide.title ?? `Banner ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[5000ms] ease-linear ${
                isActive ? "scale-100" : "scale-110"
              } ${slide.mobileImageUrl ? "hidden md:block" : ""}`}
            />
            {/* Mobile image (if provided) */}
            {slide.mobileImageUrl && (
              <img
                src={slide.mobileImageUrl}
                alt={slide.title ?? `Banner mobile ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[5000ms] ease-linear md:hidden ${
                  isActive ? "scale-100" : "scale-110"
                }`}
              />
            )}
            <div className="absolute inset-0 bg-black/10" />
          </>
        );

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.linkUrl ? (
              <Link href={slide.linkUrl} className="block w-full h-full">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </div>
        );
      })}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/30 w-4 hover:bg-white/50"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Decorative vertical text */}
      <div className="absolute right-8 bottom-10 hidden lg:block z-20">
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 rotate-90 inline-block origin-right">
          EXTENDED EDITORIAL
        </span>
      </div>
    </section>
  );
};

export default DAODUCKWEARHero;
