"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/utils/cn";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Theo dõi vị trí cuộn
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-[90] w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6 transition-transform group-hover:-translate-y-1" />
      
      {/* Hiệu ứng viền chạy xung quanh khi hover */}
      <div className="absolute inset-0 rounded-full border border-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
    </button>
  );
}
