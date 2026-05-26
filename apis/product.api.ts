import { api } from "./api";

export const productApi = {
  createProduct: async (formData: FormData) => {
    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getProducts: async (params?: any) => {
    const response = await api.get("/products", { params });
    return response.data;
  },
  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
  getAdminProducts: async (params?: any) => {
    const response = await api.get("/products/admin", { params });
    return response.data;
  },
  updateProduct: async (id: string, formData: FormData) => {
    const response = await api.patch(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateProductStatus: async (id: string, status: "active" | "inactive") => {
    const formData = new FormData();
    formData.append("status", status);
    const response = await api.patch(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  getSimilarProducts: async (slug: string, limit = 5) => {
    const response = await api.get(`/products/${slug}/similar?limit=${limit}`);
    return response.data;
  },
};
