export type CustomerProvider = "local" | "google" | "facebook";

export type CustomerOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export type CustomerOrderPaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface CustomerAddress {
  id: string;
  address: string;
  phone: string | null;
}

export interface Customer {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  provider: CustomerProvider;
  isVerified: boolean;
  isLocked: boolean;
  addresses: CustomerAddress[];
  createdAt: string;
}

export interface CustomerListParams {
  search?: string;
  provider?: CustomerProvider;
  isVerified?: "0" | "1";
  isLocked?: "0" | "1";
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerOrder {
  id: string;
  orderCode: string;
  finalTotal: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}

export interface CustomerOrdersResponse {
  data: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
}
