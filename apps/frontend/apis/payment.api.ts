import { api } from "./api";

export const paymentApi = {
  createVnpayUrl: (orderId: string) =>
    api.post<{ paymentUrl: string }>("/payments/vnpay/create", { orderId }),
};
