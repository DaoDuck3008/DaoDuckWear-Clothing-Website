"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import CartItem from "@/components/cart/CartItem";
import { LoadingLayer } from "@/components/ui/LoadingLayer";

export default function CartPage() {
  const { items, totalPrice, fetchCart, totalItems } = useCartStore();
  const hydrated = useAuthStore((s) => s.hydrated);

  const [mounted, setMounted] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const initCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initCart();
  }, [hydrated, fetchCart]);

  if (!mounted) return null;

  if (isInitialLoading && items.length === 0) {
    return <LoadingLayer isLoading={true} message="Đang nạp giỏ hàng..." />;
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-outfit">
        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-stone-200" />
        </div>
        <h1 className="text-4xl font-cormorant font-bold uppercase tracking-tighter mb-4 italic">
          Giỏ hàng của bạn đang trống
        </h1>
        <p className="text-stone-500 max-w-md mb-10 italic">
          Hãy lấp đầy giỏ hàng của bạn bằng những sản phẩm tuyệt vời nhất từ
          DaoDuckWear.
        </p>
        <Link
          href="/"
          className="bg-black text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.4em] hover:opacity-80 hover:-translate-y-1 transition-all shadow-xl flex items-center gap-4"
        >
          <ArrowLeft className="w-4 h-4" /> Bắt đầu mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-5 lg:py-6 font-outfit">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-200 pb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-cormorant font-bold uppercase tracking-tighter italic mb-4">
              Giỏ hàng <span className="text-stone-300">({totalItems()})</span>
            </h1>
            <p className="text-stone-400 font-bold uppercase tracking-[0.1em] text-xs">
              Xem lại các lựa chọn của bạn trước khi thanh toán
            </p>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-stone-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Main List */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Features/Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-stone-100">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Truck className="w-6 h-6 text-stone-900 mb-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">
                  Miễn phí vận chuyển
                </h3>
                <p className="text-[11px] text-stone-400 leading-relaxed italic">
                  Cho tất cả đơn hàng từ 1.000.000₫
                </p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <ShieldCheck className="w-6 h-6 text-stone-900 mb-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">
                  Đổi trả trong 30 ngày
                </h3>
                <p className="text-[11px] text-stone-400 leading-relaxed italic">
                  Yên tâm mua sắm với chính sách đổi trả dễ dàng
                </p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <CreditCard className="w-6 h-6 text-stone-900 mb-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">
                  Thanh toán an toàn
                </h3>
                <p className="text-[11px] text-stone-400 leading-relaxed italic">
                  Mọi thông tin thanh toán đều được bảo mật tuyệt đối
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-stone-50 p-8 lg:p-10 sticky top-32">
              <h2 className="text-2xl font-cormorant font-bold uppercase tracking-tighter italic mb-8">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-stone-200">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-500">
                  <span>Tạm tính</span>
                  <span className="text-stone-900">
                    {totalPrice().toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-500">
                  <span>Phí vận chuyển</span>
                  <span className="text-stone-900">Tính khi thanh toán</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-lg font-bold uppercase tracking-widest italic">
                  Tổng cộng
                </span>
                <div className="text-right">
                  <span className="text-3xl font-black tracking-tighter leading-none">
                    {totalPrice().toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-black text-white py-6 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-85 hover:translate-x-1 transition-all shadow-xl group"
              >
                Tiến hành thanh toán
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-6 text-[10px] text-stone-400 text-center font-bold uppercase tracking-widest italic">
                Sẵn sàng giao hàng đến bạn ngay hôm nay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
