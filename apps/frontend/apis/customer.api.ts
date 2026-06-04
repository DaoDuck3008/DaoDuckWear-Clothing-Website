import { api } from "./api";
import type {
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerOrdersResponse,
  CustomerStats,
} from "@/types/customer";

export const customerApi = {
  getStats: async (): Promise<CustomerStats> => {
    const response = await api.get("/users/customers/stats");
    return response.data;
  },

  getCustomers: async (
    params: CustomerListParams = {},
  ): Promise<CustomerListResponse> => {
    const response = await api.get("/users/customers", { params });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/users/customers/${id}`);
    return response.data;
  },

  getCustomerOrders: async (
    id: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<CustomerOrdersResponse> => {
    const response = await api.get(`/users/customers/${id}/orders`, {
      params,
    });
    return response.data;
  },

  lockCustomer: async (id: string): Promise<Customer> => {
    const response = await api.patch(`/users/customers/${id}/lock`);
    return response.data;
  },

  unlockCustomer: async (id: string): Promise<Customer> => {
    const response = await api.patch(`/users/customers/${id}/unlock`);
    return response.data;
  },

  promoteToStaff: async (
    id: string,
    shopId: string,
  ): Promise<{ success: boolean }> => {
    const response = await api.patch(`/users/customers/${id}/promote-to-staff`, {
      shopId,
    });
    return response.data;
  },
};
