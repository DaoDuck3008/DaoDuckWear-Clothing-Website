import { api } from "./api";

export const voucherApi = {
  validate: (data: { code: string; orderTotal: number }) =>
    api.post("/vouchers/validate", data),

  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "ACTIVE" | "EXPIRED" | "USED_UP" | "DELETED";
  }) => api.get("/vouchers", { params }),

  create: (data: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    expiredAt?: string;
  }) => api.post("/vouchers", data),

  update: (
    id: string,
    data: {
      discountValue?: number;
      minOrderValue?: number | null;
      maxDiscountAmount?: number | null;
      usageLimit?: number | null;
      expiredAt?: string | null;
    }
  ) => api.patch(`/vouchers/${id}`, data),

  delete: (id: string) => api.delete(`/vouchers/${id}`),
};
