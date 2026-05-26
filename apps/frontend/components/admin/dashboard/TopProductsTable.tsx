"use client";

import { Package } from "lucide-react";
import { TopProduct } from "@/apis/analytics.api";
import { formatPrice } from "@/utils/format.util";

interface TopProductsTableProps {
  data: TopProduct[];
  loading?: boolean;
}

export function TopProductsTable({ data, loading }: TopProductsTableProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900">
          Top sản phẩm bán chạy
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          theo doanh thu
        </span>
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
          Chưa có sản phẩm nào được bán
        </div>
      ) : (
        <ul className="divide-y divide-stone-100">
          {data.map((p, idx) => (
            <li
              key={p.productId}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="w-5 text-xs font-bold text-stone-400 tabular-nums">
                {idx + 1}
              </span>
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-10 w-10 rounded-lg object-cover border border-stone-100"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-stone-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {p.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  {p.unitsSold} sp đã bán
                </p>
              </div>
              <span className="text-sm font-bold text-stone-900 tabular-nums">
                {formatPrice(p.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
