import { api } from "./api";

export const reviewApi = {
  getProductReviews: async (productId: string, page = 1, limit = 10) => {
    const response = await api.get("/reviews", {
      params: { productId, page, limit },
    });
    return response.data;
  },

  getProductRatingStats: async (productId: string) => {
    const response = await api.get("/reviews/stats", {
      params: { productId },
    });
    return response.data;
  },

  getMyReview: async (productId: string) => {
    const response = await api.get("/reviews/my-review", {
      params: { productId },
    });
    return response.data;
  },

  createReview: async (dto: {
    productId: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await api.post("/reviews", dto);
    return response.data;
  },

  updateReview: async (
    id: string,
    dto: { rating?: number; comment?: string },
  ) => {
    const response = await api.patch(`/reviews/${id}`, dto);
    return response.data;
  },

  deleteReview: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};
