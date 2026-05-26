"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inventoryApi } from "@/apis/inventory.api";
import { shopApi } from "@/apis/shop.api";
import { useAuthStore } from "@/stores/auth.store";
import { ShopSelect } from "@/components/ui/ShopSelect";
import { Select } from "@/components/ui/Select";
import {
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Package,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";

type StatusFilter = "" | "ACTIVE" | "REVOKED";

export default function InventoryHistoryPage() {
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);

  const [searchProduct, setSearchProduct] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [sort, setSort] = useState("createdAt_desc");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      shopApi.getShops().then((res) => setShops(res));
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listImports({
        shopId: selectedShopId || undefined,
        status: (status || undefined) as any,
        from: from || undefined,
        to: to || undefined,
        sort,
        page,
        limit,
      });
      let rows = res.data || [];
      if (searchProduct.trim()) {
        const q = searchProduct.trim().toLowerCase();
        rows = rows.filter(
          (r: any) =>
            r.productId?.name?.toLowerCase().includes(q) ||
            r.productId?.slug?.toLowerCase().includes(q),
        );
      }
      setData(rows);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShopId, status, sort, from, to, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [selectedShopId, status, sort, from, to, searchProduct]);

  const handleReset = () => {
    setSearchProduct("");
    setSelectedShopId("");
    setStatus("");
    setSort("createdAt_desc");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <History className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            Lịch sử nhập kho
            {selectedShopId || user?.role !== "ADMIN" ? (
              <span className="text-slate-500 text-base">
                —{" "}
                {user?.role === "ADMIN"
                  ? shops.find((s) => s.id === selectedShopId)?.name
                  : user?.shop?.name}
              </span>
            ) : (
              <span className="text-slate-500 text-base">— Toàn hệ thống</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Theo dõi các đợt nhập hàng theo từng chi nhánh.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
        >
          <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Tìm sản phẩm
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="Tên hoặc slug sản phẩm..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm transition-all font-medium"
              />
            </div>
          </div>

          {user?.role === "ADMIN" && (
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Chi nhánh
              </label>
              <ShopSelect
                value={selectedShopId}
                onChange={setSelectedShopId}
                shops={shops}
              />
            </div>
          )}

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Trạng thái
            </label>
            <Select
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                { value: "", label: "Tất cả" },
                { value: "ACTIVE", label: "Còn hiệu lực" },
                { value: "REVOKED", label: "Đã thu hồi" },
              ]}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Từ ngày
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Đến ngày
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-medium"
            />
          </div>

          <div
            className={cn(
              "md:col-span-2 space-y-1.5",
              user?.role !== "ADMIN" && "md:col-span-3",
            )}
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Sắp xếp
            </label>
            <Select
              value={sort}
              onChange={setSort}
              options={[
                { value: "createdAt_desc", label: "Mới nhất" },
                { value: "createdAt_asc", label: "Cũ nhất" },
                { value: "totalQuantity_desc", label: "Số lượng nhiều" },
                { value: "totalQuantity_asc", label: "Số lượng ít" },
              ]}
            />
          </div>

          <div className="md:col-span-1 flex items-end justify-center">
            <button
              onClick={handleReset}
              className="w-full p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="Xóa bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Đang tải lịch sử...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-200" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">
                Chưa có phiếu nhập
              </p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                Tạo phiếu nhập đầu tiên từ trang Quản lý tồn kho.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 text-left">Mã phiếu</th>
                  <th className="py-3 px-4 text-left">Ngày nhập</th>
                  <th className="py-3 px-4 text-left">Sản phẩm</th>
                  <th className="py-3 px-4 text-center">Biến thể / SL</th>
                  <th className="py-3 px-4 text-left">Người tạo</th>
                  {user?.role === "ADMIN" && (
                    <th className="py-3 px-4 text-left">Chi nhánh</th>
                  )}
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row) => {
                  const isRevoked = row.status === "REVOKED";
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "hover:bg-slate-50/70 transition-colors",
                        isRevoked && "opacity-50",
                      )}
                    >
                      <td className="py-3 px-4">
                        <code className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-1 rounded font-mono">
                          #{String(row.id).slice(-6).toUpperCase()}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {row.productId?.images?.[0]?.url ? (
                              <img
                                src={row.productId.images[0].url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px]">
                              {row.productId?.name || "—"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                              {row.productId?.slug || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <p className="text-xs font-black text-slate-900">
                          {row.items?.length || 0} biến thể
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600">
                          +{row.totalQuantity}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-slate-700">
                        {row.createdBy?.fullName ||
                          row.createdBy?.username ||
                          "—"}
                      </td>
                      {user?.role === "ADMIN" && (
                        <td className="py-3 px-4 text-xs font-bold text-slate-600">
                          {row.shopId?.name || "—"}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/inventory/history/${row.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-black text-[10px] font-black uppercase tracking-widest shadow-sm transition-all"
                        >
                          Chi tiết
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="px-5 md:px-8 py-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Hiển thị <span className="text-slate-900">{data.length}</span>{" "}
              trên <span className="text-slate-900">{totalItems}</span> phiếu
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    totalPages > 7 &&
                    p !== 1 &&
                    p !== totalPages &&
                    Math.abs(p - page) > 2
                  ) {
                    if (Math.abs(p - page) === 3)
                      return (
                        <span key={p} className="px-1 text-slate-300 text-xs">
                          …
                        </span>
                      );
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-9 h-9 rounded-xl text-xs font-black transition-all",
                        page === p
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-white border border-slate-100 text-slate-500 hover:border-black hover:text-black",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Mỗi trang
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-100 hover:border-black rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition-all"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
