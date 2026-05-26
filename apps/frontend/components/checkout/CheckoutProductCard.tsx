"use client";

import React from "react";
import { Store, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCartStore } from "@/stores/cart.store";
import { useBuyNowStore } from "@/stores/buy-now.store";

interface CheckoutProductCardProps {
  item: {
    id: string;
    productId: string;
    variantId: string;
    name: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    shopId: string;
  };
  shopName: string;
  isBuyNow?: boolean;
}

export default function CheckoutProductCard({
  item,
  shopName,
  isBuyNow = false,
}: CheckoutProductCardProps) {
  const { updateQuantity: updateCartQty, removeItem: removeCartItem } = useCartStore();
  const { updateQuantity: updateBuyNowQty, clearItem: removeBuyNowItem } = useBuyNowStore();

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (isBuyNow) {
      updateBuyNowQty(qty);
    } else {
      updateCartQty(id, qty);
    }
  };

  const handleRemoveItem = (id: string) => {
    if (isBuyNow) {
      removeBuyNowItem();
    } else {
      removeCartItem(id);
    }
  };

  return (
    <div className="flex gap-6 group font-outfit">
      {/* Product Image */}
      <div className="relative w-24 h-32 flex-shrink-0">
        <div className="w-full h-full bg-white border border-stone-100 overflow-hidden shadow-sm">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="relative">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-bold uppercase tracking-tight leading-tight mb-1 text-stone-800">
              {item.name}
            </h3>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-stone-300 hover:text-red-500 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Size {item.size} — {item.color}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-200 rounded-sm bg-white">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-stone-50 transition-colors"
                >
                  <Minus className="w-3 h-3 text-stone-500" />
                </button>
                <span className="w-8 text-center text-[10px] font-black">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-stone-50 transition-colors"
                >
                  <Plus className="w-3 h-3 text-stone-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info  */}
        <div className="mt-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100/80 border border-stone-200 rounded-sm max-w-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <Store className="w-3 h-3 text-stone-500 flex-shrink-0" />
              <span className="text-[10px] text-stone-600 font-bold uppercase whitespace-nowrap truncate">
                {shopName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center text-sm font-black text-stone-900">
        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
      </div>
    </div>
  );
}
