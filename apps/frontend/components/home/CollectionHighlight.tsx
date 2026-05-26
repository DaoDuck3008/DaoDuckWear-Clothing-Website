"use client";

import Image from "next/image";
import Link from "next/link";

interface CollectionHighlightProps {
  label: string;
  heading: string;
  subheading?: string;
  description: string;
  image: string;
  href: string;
  ctaText?: string;
  imagePosition?: "left" | "right";
}

export default function CollectionHighlight({
  label,
  heading,
  subheading,
  description,
  image,
  href,
  ctaText = "Khám phá bộ sưu tập",
  imagePosition = "left",
}: CollectionHighlightProps) {
  const isImageLeft = imagePosition === "left";

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${
            isImageLeft ? "" : "md:[&>*:first-child]:order-2"
          }`}
        >
          {/* Image column */}
          <div className="group relative aspect-[3/4] md:aspect-auto md:min-h-[600px] overflow-hidden bg-editorial-surface">
            <Image
              src={image}
              alt={heading}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-all duration-700 ease-in-out group-hover:scale-105"
            />
            {/* Thin overlay */}
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* Text column */}
          <div
            className={`flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16 bg-editorial-background border border-editorial-high ${
              isImageLeft ? "border-l-0" : "border-r-0 md:order-first"
            }`}
          >
            {/* Editorial label */}
            <span className="text-[10px] uppercase tracking-[0.35em] text-editorial-accent font-bold mb-6 block">
              {label}
            </span>

            {/* Heading */}
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-bold italic leading-tight mb-3">
              {heading}
            </h2>

            {/* Subheading */}
            {subheading && (
              <p className="font-cormorant text-xl md:text-2xl text-stone-500 italic mb-6">
                {subheading}
              </p>
            )}

            {/* Divider */}
            <div className="w-12 h-px bg-stone-300 mb-6" />

            {/* Description */}
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm mb-10">
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={href}
                className="inline-flex items-center justify-center bg-black text-white py-3 px-8 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-[0.99]"
              >
                {ctaText}
              </Link>
              <Link
                href={href}
                className="inline-flex items-center justify-center border border-stone-200 py-3 px-8 text-[11px] font-medium uppercase tracking-widest hover:border-black transition-colors"
              >
                Xem lookbook
              </Link>
            </div>

            {/* Footer editorial note */}
            <p className="mt-10 text-[9px] uppercase tracking-[0.3em] text-stone-400">
              Bộ sưu tập mới nhất · DaoDuckWear
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
