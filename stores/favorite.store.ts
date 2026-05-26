import { create } from "zustand";
import { favoriteApi } from "@/apis/favorite.api";

export interface FavoriteItem {
  id: string; // productId
  name: string;
  image: string;
  price: number;
  slug: string;
}

interface FavoriteState {
  items: FavoriteItem[];
  fetchFavorites: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => Promise<void>;
  resetFavorites: () => void;
  totalItems: () => number;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  items: [],

  fetchFavorites: async () => {
    try {
      const { data } = await favoriteApi.getFavorites();
      const mappedItems = data
        .filter((fav: any) => fav.product) // Lọc bỏ các mục mà sản phẩm không còn tồn tại (bị xóa cứng)
        .map((fav: any) => ({
          id: fav.product.id,
          name: fav.product.name,
          image: fav.product.images?.[0]?.url || "",
          price: fav.product.basePrice,
          slug: fav.product.slug,
        }));
      set({ items: mappedItems });
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  },

  addItem: async (productId) => {
    try {
      const { data } = await favoriteApi.addFavorite(productId);
      const newItem: FavoriteItem = {
        id: data.product.id,
        name: data.product.name,
        image: data.product.images?.[0]?.url || "",
        price: data.product.basePrice,
        slug: data.product.slug,
      };
      set({ items: [newItem, ...get().items] });
    } catch (error) {
      console.error("Failed to add favorite:", error);
    }
  },

  removeItem: async (productId) => {
    try {
      await favoriteApi.removeFavorite(productId);
      set({ items: get().items.filter((i) => i.id !== productId) });
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  },

  isFavorite: (productId) => {
    return get().items.some((i) => i.id === productId);
  },

  clearFavorites: async () => {
    try {
      await favoriteApi.clearFavorites();
      set({ items: [] });
    } catch (error) {
      console.error("Failed to clear favorites:", error);
    }
  },

  resetFavorites: () => set({ items: [] }),

  totalItems: () => get().items.length,
}));
