"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RecentOrder } from "@/apis/analytics.api";
import { formatDate, formatPrice } from "@/utils/format.util";
import { cn } from "@/utils/cn";

interface RecentOrdersTableProps {
  data: RecentOrder[];
  loading?: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-100",
  SHIPPING: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-stone-100 text-stone-600 border-stone-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ XN",
  CONFIRMED: "Đã XN",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export function RecentOrdersTable({ data, loading }: RecentOrdersTableProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900">
          Đơn hàng gần đây
        </h3>
        <Link
          href="/admin/orders"
          className="text-[10px] uppercase tracking-widest font-bold text-rose-700 hover:text-rose-800 inline-flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-stone-50 animate-pulse"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-stone-400 text-sm italic">
          Chưa có đơn hàng nào
        </div>
      ) : (
        <ul className="divide-y divide-stone-100">
          {data.map((o) => (
            <li key={o._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  #{o.orderCode}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {o.customerName} · {formatDate(o.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded-full border",
                  STATUS_BADGE[o.status] ?? STATUS_BADGE.PENDING,
                )}
              >
                {STATUS_LABEL[o.status] ?? o.status}
              </span>
              <span className="text-sm font-bold text-stone-900 tabular-nums whitespace-nowrap">
                {formatPrice(o.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
