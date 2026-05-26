"use client";

import { useEffect, useState } from "react";
import { bannerApi } from "@/apis/banner.api";

const FALLBACKS: Record<string, string> = {
  login:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
  register:
    "https://images.unsplash.com/photo-1539106609512-725e34f7123a?q=80&w=1920&auto=format&fit=crop",
};

interface Props {
  page: "login" | "register";
}

export default function AuthImagePanel({ page }: Props) {
  const [slides, setSlides] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    bannerApi
      .getBanners({ page, position: "hero", isActive: true })
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : (data?.data ?? []);
        const urls = list.map((b: any) => b.imageUrl).filter(Boolean);
        setSlides(urls.length > 0 ? urls : [FALLBACKS[page]]);
      })
      .catch(() => setSlides([FALLBACKS[page]]));
  }, [page]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % slides.length),
      5000,
    );
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <>
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Banner ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/10" />

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-0.5 rounded-full transition-all duration-500 ${
                i === current ? "bg-white/70 w-6" : "bg-white/30 w-3"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
