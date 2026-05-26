/**
 * Utility functions for formatting data
 */

export const formatPrice = (price: number | string) => {
  const amount = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(amount)) return "0đ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};
