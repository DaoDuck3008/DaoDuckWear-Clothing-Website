import { api } from "./api";
import type {
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerOrdersResponse,
} from "@/types/customer";

export const customerApi = {
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
};
