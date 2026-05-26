"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart.type";
import { cartApi } from "@/apis/cart.api";
import { useAuthStore } from "./auth.store";

interface CartState {
  items: CartItem[];
  cartId: string | null;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,

      fetchCart: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const { data } = await cartApi.getCart();

          // Lọc bỏ các item mà sản phẩm không còn tồn tại (bị xóa cứng)
          const validItems = data.items.filter((item: any) => item.product);

          set({
            items: validItems,
            cartId: data.cartId,
          });
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      },

      addItem: async (newItem) => {
        const user = useAuthStore.getState().user;
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.variantId === newItem.variantId &&
            item.shopId === newItem.shopId,
        );

        // Optimistic Update
        let updatedItems = [...currentItems];
        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          updatedItems = [newItem, ...currentItems];
        }
        set({ items: updatedItems });

        // Sync with Backend
        if (user) {
          try {
            await cartApi.addToCart(
              newItem.variantId,
              newItem.quantity,
              newItem.shopId,
            );
            await get().fetchCart();
          } catch (error) {
            console.error("Failed to add item to backend cart:", error);
            // Có thể rollback UI ở đây nếu cần
          }
        }
      },

      removeItem: async (itemId) => {
        const user = useAuthStore.getState().user;
        const itemToRemove = get().items.find((item) => item.id === itemId);

        // Optimistic Update
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });

        // Sync with Backend
        if (user && itemToRemove?.id) {
          try {
            await cartApi.removeItem(itemToRemove.id);
          } catch (error) {
            console.error("Failed to remove item from backend:", error);
          }
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        const user = useAuthStore.getState().user;
        const itemToUpdate = get().items.find((item) => item.id === itemId);

        // Optimistic Update
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        });

        // Sync with Backend
        if (user && itemToUpdate?.id) {
          try {
            await cartApi.updateQuantity(itemToUpdate.id, quantity);
          } catch (error) {
            console.error("Failed to update quantity on backend:", error);
          }
        }
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "daoduck-cart-storage",
    },
  ),
);
