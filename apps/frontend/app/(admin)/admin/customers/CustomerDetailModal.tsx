"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Unlock,
  User as UserIcon,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { customerApi } from "@/apis/customer.api";
import { handleApiError } from "@/utils/error.util";
import { formatPrice, formatDate } from "@/utils/format.util";
import { cn } from "@/utils/cn";
import { useConfirm } from "@/hooks/useConfirm";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/constants/order";
import type {
  Customer,
  CustomerOrder,
  CustomerProvider,
} from "@/types/customer";

interface CustomerDetailModalProps {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
  onLockChanged?: (customer: Customer) => void;
}

const PROVIDER_BADGE: Record<CustomerProvider, string> = {
  local: "bg-slate-100 text-slate-700 border-slate-200",
  google: "bg-rose-50 text-rose-700 border-rose-200",
  facebook: "bg-blue-50 text-blue-700 border-blue-200",
};

const PROVIDER_LABEL: Record<CustomerProvider, string> = {
  local: "Email / Mật khẩu",
  google: "Google",
  facebook: "Facebook",
};

const ORDERS_PER_PAGE = 5;

export function CustomerDetailModal({
  open,
  customerId,
  onClose,
  onLockChanged,
}: CustomerDetailModalProps) {
  const { confirm, confirmDialog } = useConfirm();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockChanging, setLockChanging] = useState(false);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);

  const ordersTotalPages = Math.max(
    1,
    Math.ceil(ordersTotal / ORDERS_PER_PAGE),
  );

  const fetchOrders = useCallback(
    async (id: string, page: number) => {
      setOrdersLoading(true);
      try {
        const res = await customerApi.getCustomerOrders(id, {
          page,
          limit: ORDERS_PER_PAGE,
        });
        setOrders(res.data);
        setOrdersTotal(res.total);
      } catch (error) {
        handleApiError(error);
      } finally {
        setOrdersLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open || !customerId) return;
    let cancelled = false;
    setLoading(true);
    setCustomer(null);
    setOrders([]);
    setOrdersTotal(0);
    setOrdersPage(1);

    customerApi
      .getCustomerById(customerId)
      .then((data) => {
        if (!cancelled) {
          setCustomer(data);
          fetchOrders(customerId, 1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          handleApiError(err);
          onClose();
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, customerId, onClose, fetchOrders]);

  useEffect(() => {
    if (!open || !customerId || ordersPage === 1) return;
    fetchOrders(customerId, ordersPage);
  }, [open, customerId, ordersPage, fetchOrders]);

  const handleLockToggle = async () => {
    if (!customer) return;
    const willLock = !customer.isLocked;
    const ok = await confirm({
      title: willLock ? "Khóa tài khoản" : "Mở khóa tài khoản",
      description: willLock
        ? `Tài khoản "${customer.username}" sẽ không thể đăng nhập cho đến khi được mở khóa.`
        : `Tài khoản "${customer.username}" sẽ có thể đăng nhập trở lại.`,
      confirmText: willLock ? "Khóa" : "Mở khóa",
    });
    if (!ok) return;
    setLockChanging(true);
    try {
      const updated = willLock
        ? await customerApi.lockCustomer(customer.id)
        : await customerApi.unlockCustomer(customer.id);
      setCustomer(updated);
      onLockChanged?.(updated);
      toast.success(willLock ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
    } catch (error) {
      handleApiError(error);
    } finally {
      setLockChanging(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Chi tiết khách hàng
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Chế độ chỉ xem</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading || !customer ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              <p className="text-sm text-slate-500">Đang tải thông tin...</p>
            </div>
          ) : (
            <>
              {/* Section: Tài khoản */}
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Tài khoản
                </h3>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                    {customer.avatar ? (
                      <Image
                        src={customer.avatar}
                        alt={customer.username}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-slate-900">
                      {customer.username}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                          PROVIDER_BADGE[customer.provider],
                        )}
                      >
                        {PROVIDER_LABEL[customer.provider]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                          customer.isVerified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {customer.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                          customer.isLocked
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}
                      >
                        {customer.isLocked ? "Đã khóa" : "Hoạt động"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3">
                      Ngày tạo: {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Section: Địa chỉ */}
              <section className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pt-4 mb-4">
                  Địa chỉ giao hàng ({customer.addresses.length})
                </h3>
                {customer.addresses.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    Khách hàng chưa thêm địa chỉ nào.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customer.addresses.map((addr) => (
                      <div
                        key={addr.id || addr.address}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/40"
                      >
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 break-words">
                            {addr.address}
                          </p>
                          {addr.phone && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {addr.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section: Lịch sử đơn hàng */}
              <section className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pt-4 mb-4">
                  Lịch sử đơn hàng ({ordersTotal})
                </h3>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">
                      Đang tải đơn hàng...
                    </span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                    <p className="text-sm">Khách chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {orders.map((order) => (
                        <a
                          key={order.id}
                          href={`/admin/orders?orderCode=${order.orderCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              #{order.orderCode}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {formatPrice(order.finalTotal)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider",
                                  STATUS_COLORS[order.status],
                                )}
                              >
                                {STATUS_LABELS[order.status]}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider",
                                  PAYMENT_STATUS_COLORS[order.paymentStatus],
                                )}
                              >
                                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {order.itemCount} sản phẩm
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>

                    {ordersTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Trang {ordersPage} / {ordersTotalPages}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setOrdersPage((p) => Math.max(1, p - 1))
                            }
                            disabled={ordersPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setOrdersPage((p) =>
                                Math.min(ordersTotalPages, p + 1),
                              )
                            }
                            disabled={ordersPage >= ordersTotalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          {customer && (
            <button
              type="button"
              onClick={handleLockToggle}
              disabled={lockChanging}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50",
                customer.isLocked
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
              )}
            >
              {lockChanging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : customer.isLocked ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {customer.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>

      {confirmDialog}
    </div>
  );
}
