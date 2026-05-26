import { api } from "./api";

export const cartApi = {
  getCart: () => {
    return api.get("/cart");
  },

  addToCart: (variantId: string, quantity: number, shopId: string) => {
    return api.post("/cart/add", { variantId, quantity, shopId });
  },

  updateQuantity: (itemId: string, quantity: number) => {
    return api.patch(`/cart/item/${itemId}`, { quantity });
  },

  removeItem: (itemId: string) => {
    return api.delete(`/cart/item/${itemId}`);
  },

  clearCart: () => {
    return api.delete("/cart/clear");
  },

  mergeCart: (items: { variantId: string; quantity: number }[]) => {
    return api.post("/cart/merge", { items });
  },
};
