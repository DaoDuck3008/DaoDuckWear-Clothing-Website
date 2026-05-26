"use client";

import React, { useEffect, useState } from "react";
import { X, Heart, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import ModalPortal from "../ui/modalPortal";
import { useFavoriteStore } from "@/stores/favorite.store";
import Link from "next/link";
import { toast } from "react-toastify";
import { useConfirm } from "@/hooks/useConfirm";

interface FavoriteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoriteSidebar({
  isOpen,
  onClose,
}: FavoriteSidebarProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const { items, removeItem, totalItems, clearFavorites } = useFavoriteStore();
  const { confirm, confirmDialog } = useConfirm();

  // Xử lý hiệu ứng slide vào và ra
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimate(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "auto";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClearAll = async () => {
    const ok = await confirm({
      title: "Xóa tất cả yêu thích",
      description: "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm yêu thích?",
      confirmText: "Xóa tất cả",
    });
    if (!ok) return;
    await clearFavorites();
    toast.info("Đã xóa tất cả sản phẩm yêu thích");
  };

  if (!shouldRender) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            isAnimate ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
        />

        {/* Sidebar Content */}
        <div
          className={cn(
            "relative w-full max-w-[480px] bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out",
            isAnimate ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-editorial-accent fill-editorial-accent" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Danh sách yêu thích ({totalItems()})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Favorite Items List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 no-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-stone-400">
                <Heart className="w-12 h-12 opacity-20" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-center">
                  Danh sách đang trống
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-[9px] font-bold uppercase tracking-widest text-black underline underline-offset-4"
                >
                  Khám phá ngay
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-24 h-32 bg-stone-50 overflow-hidden border border-stone-100 shrink-0">
                    <img
                      src={
                        item.image ||
                        "https://placehold.co/400x600?text=No+Image"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={onClose}
                        className="text-[10px] font-bold uppercase tracking-wider truncate hover:text-stone-500 transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold tracking-tight mb-4">
                      {item.price.toLocaleString("vi-VN")}₫
                    </p>

                    <div className="mt-auto flex items-center gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={onClose}
                        className="flex-1 bg-black text-white py-2.5 text-[9px] font-bold uppercase tracking-widest text-center hover:bg-stone-800 transition-all"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-3">
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center gap-2 text-red-600 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
              <Link
                href="/products"
                onClick={onClose}
                className="w-full bg-white border border-stone-200 text-black h-12 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-stone-50 transition-all active:scale-[0.98]"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>
      </div>
      {confirmDialog}
    </ModalPortal>
  );
}
