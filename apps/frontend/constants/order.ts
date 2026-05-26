export const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao hàng" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  SHIPPING: "bg-indigo-50 text-indigo-600 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
};

export const STATUS_DISPLAY: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Chờ xử lý", color: "text-amber-500", bg: "bg-amber-50" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-blue-500", bg: "bg-blue-50" },
  SHIPPING: {
    label: "Đang giao hàng",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  CANCELLED: { label: "Đã hủy", color: "text-rose-500", bg: "bg-rose-50" },
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const NEXT_STATUS: Record<string, string | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPING",
  SHIPPING: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

export const NEXT_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Xác nhận đơn",
  SHIPPING: "Giao hàng",
  COMPLETED: "Hoàn thành đơn",
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả thanh toán" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "ALL", label: "Tất cả phương thức" },
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "VNPAY", label: "VNPAY" },
  { value: "MOMO", label: "MOMO" },
];

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: "text-rose-500 bg-rose-50 border-rose-100",
  PAID: "text-emerald-500 bg-emerald-50 border-emerald-100",
  REFUNDED: "text-slate-500 bg-slate-50 border-slate-100",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPAY",
  MOMO: "MOMO",
};
