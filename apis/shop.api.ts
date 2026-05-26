import { api } from "./api";

export const shopApi = {
  getShops: async () => {
    const response = await api.get("/shops");
    return response.data;
  },
};
