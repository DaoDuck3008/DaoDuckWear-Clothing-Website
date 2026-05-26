import { api } from "./api";

export const colorApi = {
  getAll: () => api.get("/colors"),
};
