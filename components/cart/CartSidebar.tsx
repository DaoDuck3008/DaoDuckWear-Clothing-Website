"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import ModalPortal from "../ui/modalPortal";
import { useCartStore } from "@/stores/cart.store";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore();

  const router = useRouter();

  // Xử lý hiệu ứng slide vào và ra
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      // Delay một chút để đảm bảo DOM đã render trước khi chạy animation
      const timer = setTimeout(() => setIsAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimate(false);
      // Đợi animation chạy xong (300ms) rồi mới gỡ component khỏi DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "auto";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.warning("Giỏ hàng đang trống");
      return;
    }

    router.push("/checkout");
    onClose();
  };

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
              <ShoppingBag className="w-5 h-5" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Giỏ hàng của bạn ({totalItems()})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 no-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-stone-400">
                <ShoppingBag className="w-12 h-12 opacity-20" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
                  Giỏ hàng đang trống
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-[9px] font-bold uppercase tracking-widest text-black underline underline-offset-4"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex gap-4 group">
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
                        onClick={() => removeItem(item.id ?? "")}
                        className="text-stone-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[9px] text-stone-400 uppercase mb-4">
                      Màu: {item.color} / Size: {item.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-stone-100 rounded-sm">
                        <button
                          onClick={() =>
                            updateQuantity(item.id ?? "", item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-stone-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">
                          {item.quantity < 10
                            ? `0${item.quantity}`
                            : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id ?? "", item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-stone-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold tracking-tight">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                  Tạm tính:
                </span>
                <span className="text-lg font-bold tracking-tight text-black">
                  {totalPrice().toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white h-12 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98]"
                >
                  Tiến hành thanh toán
                </button>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full bg-white border border-stone-200 text-black h-12 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-stone-50 transition-all active:scale-[0.98]"
                >
                  Xem giỏ hàng chi tiết
                </Link>
              </div>
              <p className="text-[9px] text-stone-400 text-center mt-6 uppercase tracking-widest">
                Miễn phí vận chuyển cho đơn hàng từ 1.000.000₫
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
