"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  Calendar as CalendarIcon,
  CreditCard,
  User,
  Store,
} from "lucide-react";
import { formatPrice } from "@/utils/format.util";
import { cn } from "@/utils/cn";
import {
  STATUS_DISPLAY,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  NEXT_STATUS,
  NEXT_STATUS_LABEL,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/constants/order";

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  SHIPPING: Truck,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

interface OrderCardProps {
  order: any;
  variant: "admin" | "user";
  onUpdateStatus?: (orderId: string, status: string) => void;
  onCancel?: (orderId: string) => void;
  updatingId?: string | null;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  variant,
  onUpdateStatus,
  onCancel,
  updatingId,
}) => {
  const statusConfig = STATUS_DISPLAY[order.status] || STATUS_DISPLAY.PENDING;
  const StatusIcon =
    STATUS_ICONS[order.status as keyof typeof STATUS_ICONS] || Clock;
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const isUpdating = updatingId === order.id;

  const href =
    variant === "admin"
      ? `/admin/orders/${order.orderCode}`
      : `/profile/orders/${order.id}`;

  return (
    <div className="group bg-white border border-stone-100 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-stone-100 transition-all duration-500 relative">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Detailed Info */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border",
                  variant === "admin"
                    ? STATUS_COLORS[order.status]
                    : cn(statusConfig.bg, statusConfig.color),
                )}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {variant === "admin"
                  ? STATUS_LABELS[order.status]
                  : statusConfig.label}
              </span>
              <span
                className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-stone-100",
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100",
                )}
              >
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>

              {variant === "admin" && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  <Store className="w-3 h-3" />
                  {Array.from(
                    new Set(order.items.map((item: any) => item.shopId?.name)),
                  )
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-50 rounded-full text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                <CalendarIcon className="w-3.5 h-3.5" />
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <h4 className="text-lg font-black text-black uppercase tracking-tighter flex items-center gap-3 group-hover:text-indigo-600 transition-colors">
                  #{order.orderCode}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                    {order.items.length} Sản phẩm
                  </span>
                </div>
              </div>

              {variant === "admin" && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">
                      Khách hàng
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {order.shippingAddress.fullName}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400">
                      {order.shippingAddress.phone}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">
                    Thanh toán
                  </span>
                  <span className="text-[10px] font-bold text-stone-700">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ||
                      order.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-1">
                  Tổng tiền
                </p>
                <p className="text-xl font-black text-black tracking-tighter">
                  {formatPrice(order.finalTotal)}
                </p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="flex -space-x-3 items-center pt-2">
              {order.items.slice(0, 5).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="w-14 h-14 rounded-2xl border-4 border-white bg-stone-50 overflow-hidden shadow-sm relative group/item"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover/item:scale-125 transition-transform duration-500"
                  />
                </div>
              ))}
              {order.items.length > 5 && (
                <div className="w-14 h-14 rounded-2xl border-4 border-white bg-black flex items-center justify-center text-white text-[10px] font-black shadow-sm relative z-10">
                  +{order.items.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col lg:w-48 gap-3 justify-center border-t lg:border-t-0 lg:border-l border-stone-50 pt-6 lg:pt-0 lg:pl-8">
            {variant === "admin" && NEXT_STATUS[order.status] && (
              <button
                onClick={() =>
                  onUpdateStatus?.(order.id, NEXT_STATUS[order.status]!)
                }
                disabled={isUpdating}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white hover:bg-black rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  NEXT_STATUS_LABEL[NEXT_STATUS[order.status]!]
                )}
              </button>
            )}

            <Link
              href={href}
              className={cn(
                "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest group/btn",
                variant === "user"
                  ? "bg-black text-white hover:bg-stone-800 shadow-xl shadow-stone-100"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100",
              )}
            >
              Chi tiết
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>

            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(order.id)}
                disabled={isUpdating}
                className="px-6 py-4 border border-stone-100 text-stone-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Hủy đơn hàng"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
