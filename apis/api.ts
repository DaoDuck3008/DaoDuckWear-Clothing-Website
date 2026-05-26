import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }
    return searchParams.toString();
  },
});

// gắn access_token vào header của mọi request mọi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// xử lý refresh_token khi access_token hết hạn
let isRefreshing = false;
let queue: any[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const token = useAuthStore.getState().access_token;

    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    // Lấy token từ header của request bị lỗi thay vì chỉ lấy từ store
    const authHeader =
      originalRequest.headers?.Authorization ||
      originalRequest.headers?.authorization;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      // Nếu có token (trong store hoặc trong header) thì mới thử refresh
      if (token || authHeader) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const res = await api.post("/auth/refresh");
            const { accessToken } = res.data;

            useAuthStore
              .getState()
              .setAuth(accessToken, useAuthStore.getState().user!);

            isRefreshing = false;
            queue.forEach((cb) => cb(accessToken));
            queue = [];

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (err) {
            const hasToken = useAuthStore.getState().access_token;

            if (hasToken) {
              useAuthStore.getState().clearAuth();
              window.location.href = "/login";
            }

            return Promise.reject(err);
          }
        }

        return new Promise((resolve) => {
          queue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    // Đối với các lỗi khác, chúng ta để component tự catch bằng handleError helper
    return Promise.reject(error);
  },
);
