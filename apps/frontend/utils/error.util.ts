import { AxiosError } from "axios";
import { ApiError } from "@/types/api";
import { toast } from "react-toastify";

/**
 * Tiện ích xử lý lỗi từ API một cách thống nhất cho toàn bộ Frontend.
 * Nó sẽ bóc tách dữ liệu từ cấu trúc chuẩn RESTful mà Backend trả về (success, statusCode, errorCode, message, errors).
 *
 * @param error - Đối tượng lỗi từ Axios hoặc lỗi không xác định
 * @param customMessage - Thông báo thay thế nếu bạn không mún dùng message từ Backend
 */
export const handleApiError = (error: unknown, customMessage?: string) => {
  const axiosError = error as AxiosError<ApiError>;

  // 1. Trích xuất dữ liệu lỗi từ response của backend
  const apiError = axiosError.response?.data;

  // 2. Xác định message hiển thị:
  // 5xx luôn dùng message generic — không để lộ chi tiết hệ thống ra ngoài dù backend có gửi gì.
  // 4xx lấy message từ backend (nghiệp vụ) -> customMessage -> fallback Axios.
  const status = axiosError.response?.status ?? 0;
  const message =
    status >= 500
      ? (customMessage ?? "Hệ thống gặp sự cố, vui lòng thử lại sau!")
      : apiError?.message ||
        customMessage ||
        axiosError.message ||
        "Đã có lỗi xảy ra, vui lòng thử lại sau!";

  // 3. Xử lý hiển thị thông báo lỗi
  if (apiError?.errors && Array.isArray(apiError.errors)) {
    // Trường hợp lỗi Validation (có danh sách các field bị sai)
    // Hiển thị message tổng quát trước
    toast.error(message);

    // Hiển thị chi tiết từng lỗi nhỏ (nếu cần)
    apiError.errors.forEach((err) => {
      toast.error(`• ${err}`);
    });
  } else {
    // Trường hợp lỗi thông thường hoặc lỗi logic nghiệp vụ
    toast.error(message);
  }

  // 4. Logging nâng cao cho môi trường Development
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "development"
  ) {
    if (status >= 400 && status < 500) {
      // không log các lỗi nghiệp vụ (Client Errors: 400, 401, 403, 404...)
      console.warn(
        `[API Business Error] ${status} at ${axiosError.config?.url}: ${message}`,
      );
      if (apiError?.errors) {
        console.warn("Validation Details:", apiError.errors);
      }
    } else {
      // Log chi tiết cho lỗi Server (5xx) hoặc lỗi hệ thống/Network
      console.group("--- [FRONTEND API ERROR] ---");
      console.error(
        `Endpoint: [${axiosError.config?.method?.toUpperCase()}] ${axiosError.config?.url}`,
      );
      console.error(`Status: ${status} (${apiError?.errorCode || "N/A"})`);
      console.error(`Message: ${message}`);
      if (apiError?.errors)
        console.error("Validation Errors:", apiError.errors);
      if (apiError?.stack) {
        console.error("Server Stack Trace:");
        console.error(apiError.stack);
      }
      console.groupEnd();
    }
  }

  // Trả về object lỗi đã được chuẩn hóa
  return {
    message,
    errorCode: apiError?.errorCode,
    errors: apiError?.errors,
    statusCode: status || 500,
  };
};
