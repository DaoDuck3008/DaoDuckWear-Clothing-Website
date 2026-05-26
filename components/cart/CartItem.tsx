"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, Store } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { CartItem as CartItemType } from "@/types/cart.type";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="group flex flex-col md:flex-row md:items-center gap-6 py-8 border-b border-stone-100 last:border-0 font-outfit">
      {/* Product Image */}
      <Link 
        href={`/products/${item.slug}`}
        className="relative w-full md:w-32 aspect-[3/4] overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Link 
            href={`/products/${item.slug}`}
            className="text-lg font-bold uppercase tracking-tight text-stone-900 hover:text-stone-500 transition-colors leading-tight"
          >
            {item.name}
          </Link>
          <button
            onClick={() => removeItem(item.id ?? "")}
            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
            title="Xóa sản phẩm"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Size: <span className="text-stone-900">{item.size}</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Màu: <span className="text-stone-900">{item.color}</span>
          </span>
        </div>

        {/* Shop Info Badge */}
        <div className="mb-4 md:mb-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-100 rounded-sm">
            <Store className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
              {item.shopName || "Chi nhánh DaoDuckWear"}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity & Price Section */}
      <div className="flex items-center justify-between md:justify-end md:gap-16">
        {/* Quantity Selector */}
        <div className="flex items-center border border-stone-200 rounded-sm bg-white overflow-hidden">
          <button
            onClick={() => updateQuantity(item.id ?? "", item.quantity - 1)}
            className="p-2.5 hover:bg-stone-50 transition-colors"
          >
            <Minus className="w-4 h-4 text-stone-600" />
          </button>
          <span className="w-12 text-center text-sm font-black">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id ?? "", item.quantity + 1)}
            className="p-2.5 hover:bg-stone-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {/* Pricing */}
        <div className="text-right">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
            Tổng cộng
          </div>
          <div className="text-xl font-black tracking-tighter text-stone-900">
            {(item.price * item.quantity).toLocaleString("vi-VN")}₫
          </div>
          <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
            {item.price.toLocaleString("vi-VN")}₫ / sản phẩm
          </div>
        </div>
      </div>
    </div>
  );
}
