"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Share2,
  Heart,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  selectedColor: string | null;
  variantImage?: string | null;
  productName: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/600x800?text=No+Image";

export default function ProductGallery({
  images,
  selectedColor,
  variantImage,
  productName,
  isFavorite = false,
  onToggleFavorite,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUsingVariantImage, setIsUsingVariantImage] = useState(false);
  const thumbRef = React.useRef<HTMLDivElement>(null);

  // Đồng bộ ảnh khi đổi màu hoặc nhận variantImage mới
  useEffect(() => {
    if (variantImage) {
      setIsUsingVariantImage(true);
      return;
    }

    if (selectedColor) {
      setIsUsingVariantImage(false);
      const colorIndex = images.findIndex((img) => img.color === selectedColor);
      if (colorIndex !== -1) setActiveIndex(colorIndex);
    }
  }, [selectedColor, variantImage, images]);

  // Tự động cuộn thumbnail vào vùng nhìn thấy
  useEffect(() => {
    if (thumbRef.current) {
      const activeThumb = thumbRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUsingVariantImage(false);
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUsingVariantImage(false);
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const activeImage =
    isUsingVariantImage && variantImage
      ? variantImage
      : images[activeIndex]?.url || PLACEHOLDER_IMAGE;

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        {/* Thumbnails */}
        <div
          ref={thumbRef}
          className="flex lg:flex-col gap-3 overflow-x-hidden lg:overflow-y-auto no-scrollbar max-h-[600px] pb-2 lg:pb-0"
        >
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => {
                setIsUsingVariantImage(false);
                setActiveIndex(idx);
              }}
              className={cn(
                "w-20 h-24 border flex-shrink-0 transition-all overflow-hidden  bg-white",
                !isUsingVariantImage && activeIndex === idx
                  ? "border-black scale-105 shadow-md z-10"
                  : "border-stone-100 hover:border-stone-300",
              )}
            >
              <img
                src={img.url || PLACEHOLDER_IMAGE}
                alt={`${productName} thumbnail ${idx}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>

        {/* Main Image Container */}
        <div
          className="flex-1 bg-white aspect-[3/4] lg:h-[600px] relative overflow-hidden group border border-stone-100 cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={activeImage}
            alt={productName}
            className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white z-20 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white z-20 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Hover Label */}
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-3 py-1.5 text-[8px] font-bold text-white uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
            <Maximize2 className="w-3 h-3" />
            Xem chi tiết ảnh
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className={cn(
                "backdrop-blur p-2.5 transition-all shadow-sm rounded-full",
                isFavorite
                  ? "bg-editorial-accent text-white"
                  : "bg-white/90 hover:bg-black hover:text-white text-black",
              )}
            >
              <Heart
                className={cn("w-4 h-4", isFavorite ? "fill-white" : "")}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Share logic could go here
              }}
              className="bg-white/90 backdrop-blur p-2.5 hover:bg-black hover:text-white transition-all shadow-sm rounded-full text-black"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Layer */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex justify-between items-center p-6 text-white bg-gradient-to-b from-black/50 to-transparent">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
              {productName}{" "}
              <span className="text-stone-400 ml-4 font-medium">
                {activeIndex + 1} / {images.length}
              </span>
            </p>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-12 h-12 flex items-center justify-center hover:bg-white/10 transition-colors rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative flex flex-col items-center justify-center min-h-0">
            <button
              onClick={handlePrev}
              className="absolute left-6 w-14 h-14 bg-white/5 hover:bg-white/20 flex items-center justify-center rounded-full transition-all text-white z-20"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div className="flex-1 w-full flex items-center justify-center p-4 min-h-0">
              <img
                src={images[activeIndex]?.url || PLACEHOLDER_IMAGE}
                alt="Fullscreen"
                className="max-w-full max-h-full object-contain shadow-2xl transition-all duration-500 animate-in zoom-in-95"
              />
            </div>

            <button
              onClick={handleNext}
              className="absolute right-6 w-14 h-14 bg-white/5 hover:bg-white/20 flex items-center justify-center rounded-full transition-all text-white z-20"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Bottom Thumbnail Bar */}
          <div className="h-32 flex-shrink-0 flex justify-center items-center gap-4 px-8 bg-gradient-to-t from-black/80 to-transparent">
            <div
              ref={thumbRef}
              className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-2"
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "w-14 h-20 border-2 transition-all flex-shrink-0 bg-white overflow-hidden",
                    activeIndex === idx
                      ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      : "border-transparent opacity-40 hover:opacity-100 hover:scale-105",
                  )}
                >
                  <img
                    src={img.url || PLACEHOLDER_IMAGE}
                    alt="thumb"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
