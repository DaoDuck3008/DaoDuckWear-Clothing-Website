import { api } from "./api";

export interface ImportItemPayload {
  variantId: string;
  quantity: number;
}

export const inventoryApi = {
  getInventory: async (params: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    sort?: string;
    shopId?: string;
  }) => {
    const res = await api.get("/inventory", { params });
    return res.data;
  },

  getProductInventory: async (slug: string, shopId?: string) => {
    const res = await api.get(`/inventory/${slug}`, { params: { shopId } });
    return res.data;
  },

  createImport: async (data: {
    productId: string;
    items: ImportItemPayload[];
    shopId?: string;
    note?: string;
  }) => {
    const res = await api.post("/inventory/imports", data);
    return res.data;
  },

  listImports: async (params: {
    shopId?: string;
    productId?: string;
    status?: "ACTIVE" | "REVOKED";
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const res = await api.get("/inventory/imports", { params });
    return res.data;
  },

  getImportDetail: async (id: string) => {
    const res = await api.get(`/inventory/imports/${id}`);
    return res.data;
  },

  revokeImport: async (id: string, data: { note?: string } = {}) => {
    const res = await api.patch(`/inventory/imports/${id}/revoke`, data);
    return res.data;
  },
};
