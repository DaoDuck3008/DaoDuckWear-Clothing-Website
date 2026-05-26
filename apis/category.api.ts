import { api } from "./api";

export const categoryApi = {
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getAdminCategories: async () => {
    const response = await api.get("/categories/admin");
    return response.data;
  },

  createCategory: async (data: { name: string; parentId?: string | null }) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: { name?: string; parentId?: string | null },
  ) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
