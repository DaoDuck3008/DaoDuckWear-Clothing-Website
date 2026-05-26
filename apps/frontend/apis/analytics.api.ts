import { api } from "./api";

export interface AnalyticsRangeParams {
  fromDate?: string;
  toDate?: string;
}

export interface SummaryResponse {
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
  customerCount?: number;
  productCount?: number;
  totalProducts?: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusBucket {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPING"
    | "COMPLETED"
    | "CANCELLED";
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  image?: string;
  unitsSold: number;
  revenue: number;
}

export interface RecentOrder {
  _id: string;
  orderCode: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface CategoryBucket {
  categoryId: string | null;
  name: string;
  count: number;
}

export const analyticsApi = {
  getSummary: (params: AnalyticsRangeParams) =>
    api
      .get<SummaryResponse>("/analytics/summary", { params })
      .then((r) => r.data),
  getRevenueSeries: (params: AnalyticsRangeParams) =>
    api
      .get<RevenuePoint[]>("/analytics/revenue-series", { params })
      .then((r) => r.data),
  getOrdersByStatus: (params: AnalyticsRangeParams) =>
    api
      .get<StatusBucket[]>("/analytics/orders-by-status", { params })
      .then((r) => r.data),
  getTopProducts: (params: AnalyticsRangeParams) =>
    api
      .get<TopProduct[]>("/analytics/top-products", { params })
      .then((r) => r.data),
  getRecentOrders: (params: AnalyticsRangeParams) =>
    api
      .get<RecentOrder[]>("/analytics/recent-orders", { params })
      .then((r) => r.data),
  getProductsByCategory: (params: AnalyticsRangeParams) =>
    api
      .get<CategoryBucket[]>("/analytics/products-by-category", { params })
      .then((r) => r.data),
};
