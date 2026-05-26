import { api } from "./api";

export const orderApi = {
  createOrder: (data: any) => {
    return api.post("/orders", data);
  },
  getMyOrders: (params?: any) => {
    return api.get("/orders/my-orders", { params });
  },
  getOrder: (id: string) => {
    return api.get(`/orders/${id}`);
  },
  getAdminOrders: (params: any) => {
    return api.get("/orders/admin", { params });
  },
  getAdminOrderDetail: (id: string) => {
    return api.get(`/orders/admin/${id}`);
  },
  getAdminOrderByCode: (orderCode: string) => {
    return api.get(`/orders/admin/code/${orderCode}`);
  },
  updateOrderStatus: (id: string, status: string) => {
    return api.patch(`/orders/${id}/status`, { status });
  },
  cancelMyOrder: (id: string) => {
    return api.patch(`/orders/my-orders/${id}/cancel`);
  },
  confirmReceipt: (id: string) => {
    return api.patch(`/orders/my-orders/${id}/confirm-receipt`);
  },
};
