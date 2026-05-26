import { api } from "./api";

export const bannerApi = {
  getBanners: async (params?: any) => {
    const response = await api.get("/banners", { params });
    return response.data;
  },
  getBanner: async (id: string) => {
    const response = await api.get(`/banners/${id}`);
    return response.data;
  },
  createBanner: async (formData: FormData) => {
    const response = await api.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updateBanner: async (id: string, formData: FormData) => {
    const response = await api.patch(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  toggleStatus: async (id: string) => {
    const response = await api.patch(`/banners/${id}/toggle`);
    return response.data;
  },
  deleteBanner: async (id: string) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};
