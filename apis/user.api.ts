import { api } from "./api";
import type {
  CreateStaffPayload,
  Staff,
  StaffListParams,
  StaffListResponse,
  UpdateStaffPayload,
} from "@/types/staff";

export const userApi = {
  getStaff: async (
    params: StaffListParams = {},
  ): Promise<StaffListResponse> => {
    const response = await api.get("/users/staff", { params });
    return response.data;
  },

  getStaffById: async (id: string): Promise<Staff> => {
    const response = await api.get(`/users/staff/${id}`);
    return response.data;
  },

  createStaff: async (body: CreateStaffPayload): Promise<Staff> => {
    const response = await api.post("/users/staff", body);
    return response.data;
  },

  updateStaff: async (id: string, body: UpdateStaffPayload): Promise<Staff> => {
    const response = await api.patch(`/users/staff/${id}`, body);
    return response.data;
  },

  deleteStaff: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/users/staff/${id}`);
    return response.data;
  },

  resetStaffPassword: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/users/staff/${id}/reset-password`);
    return response.data;
  },
};
