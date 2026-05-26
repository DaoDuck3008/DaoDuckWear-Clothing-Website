import { api } from "./api";

export const favoriteApi = {
  getFavorites: () => api.get("/favorites"),
  addFavorite: (productId: string) => api.post(`/favorites/${productId}`),
  removeFavorite: (productId: string) => api.delete(`/favorites/${productId}`),
  clearFavorites: () => api.delete("/favorites/clear"),
  checkIsFavorite: (productId: string) =>
    api.get(`/favorites/check/${productId}`),
};
