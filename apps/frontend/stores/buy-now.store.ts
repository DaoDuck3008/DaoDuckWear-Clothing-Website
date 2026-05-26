"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BuyNowItem {
  id: string;
  productId: string;
  variantId: string;
  shopId: string;
  shopName: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface BuyNowState {
  item: BuyNowItem | null;
  setItem: (item: BuyNowItem) => void;
  updateQuantity: (quantity: number) => void;
  clearItem: () => void;
}

export const useBuyNowStore = create<BuyNowState>()(
  persist(
    (set, get) => ({
      item: null,
      setItem: (item) => set({ item }),
      updateQuantity: (quantity) => {
        const { item } = get();
        if (item && quantity > 0) {
          set({ item: { ...item, quantity } });
        }
      },
      clearItem: () => set({ item: null }),
    }),
    {
      name: "daoduck-buynow-storage",
    }
  )
);
