"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn } from "@/utils/cn";
import { useFavoriteStore } from "@/stores/favorite.store";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string; isMain: boolean }[];
    category?: { name: string };
  };
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, addItem, removeItem } = useFavoriteStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const mainImage = product.images.find((img) => img.isMain)?.url || product.images[0]?.url;
  const hoverImage = product.images.find((img) => !img.isMain)?.url || mainImage;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      router.push("/login");
      return;
    }

    if (isFavorite(product.id)) {
      await removeItem(product.id);
      toast.info("Đã xóa khỏi danh sách yêu thích");
    } else {
      await addItem(product.id);
      toast.success("Đã thêm vào danh sách yêu thích");
    }
  };

  return (
    <div
      className={cn("group flex flex-col gap-3", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        {/* Images */}
        <img
          src={mainImage}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-in-out",
            isHovered ? "opacity-0 scale-110" : "opacity-100 scale-100"
          )}
        />
        <img
          src={hoverImage}
          alt={product.name}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        />

        {/* Badges / Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-black hover:text-white transition-all",
              isFavorite(product.id) && "bg-editorial-accent text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite(product.id) && "fill-current")} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-black hover:text-white transition-all">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action */}
        <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-black/90 backdrop-blur-sm text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Xem chi tiết
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-1 px-1">
        {product.category && (
          <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">
            {product.category.name}
          </span>
        )}
        <Link 
          href={`/products/${product.slug}`}
          className="text-xs font-bold uppercase tracking-wider line-clamp-1 hover:text-stone-500 transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-sm font-bold tracking-tight">
          {product.basePrice.toLocaleString("vi-VN")}₫
        </p>
      </div>
    </div>
  );
}
