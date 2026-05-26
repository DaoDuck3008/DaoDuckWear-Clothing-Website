import { api } from "./api";

export const health = async () => {
  return api.get("/");
};
