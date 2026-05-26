"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { orderApi } from "@/apis/order.api";
import { OrderCard } from "@/components/order/OrderCard";
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  Filter,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import { PAYMENT_STATUS_OPTIONS } from "@/constants/order";
import { Select } from "@/components/ui/Select";
import { useConfirm } from "@/hooks/useConfirm";

// ─── Status tab config ─────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "", label: "Tất cả", Icon: null },
  { value: "PENDING", label: "Chờ xử lý", Icon: Clock },
  { value: "CONFIRMED", label: "Xác nhận", Icon: PackageCheck },
  { value: "SHIPPING", label: "Đang giao", Icon: Truck },
  { value: "COMPLETED", label: "Hoàn thành", Icon: CheckCircle2 },
  { value: "CANCELLED", label: "Đã hủy", Icon: XCircle },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function OrdersProfilePage() {
  const searchParams = useSearchParams();
  const { confirm, confirmDialog } = useConfirm();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? "",
  );
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const hasActiveFilters =
    searchTerm || paymentStatusFilter || fromDate || toDate;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders({
        orderCode: searchTerm,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        fromDate,
        toDate,
        page,
        limit,
      });
      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, paymentStatusFilter, fromDate, toDate, page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleCancelOrder = async (orderId: string) => {
    const ok = await confirm({
      title: "Hủy đơn hàng",
      description:
        "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.",
      confirmText: "Hủy đơn",
    });
    if (!ok) return;
    setCancellingId(orderId);
    try {
      await orderApi.cancelMyOrder(orderId);
      toast.success("Hủy đơn hàng thành công");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Hủy đơn hàng thất bại");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="w-full space-y-5">

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">
            Đơn hàng của tôi
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Tổng cộng{" "}
            <span className="text-black font-bold">{totalItems}</span> đơn hàng
          </p>
        </div>
      </div>

      {/* ── Status tab bar ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex min-w-max">
          {STATUS_TABS.map(({ value, label, Icon }) => {
            const isActive = statusFilter === value;
            return (
              <button
                key={value}
                onClick={() => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border-b-2",
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50",
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Advanced filter (collapsible) ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
              Bộ lọc nâng cao
            </span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-4 h-4 bg-black text-white text-[8px] font-black rounded-full">
                !
              </span>
            )}
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 text-stone-400 transition-transform duration-200",
              filterOpen && "rotate-90",
            )}
          />
        </button>

        {filterOpen && (
          <div className="px-6 pb-6 border-t border-stone-50 pt-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                  Mã đơn hàng
                </label>
                <div className="flex items-center gap-2.5 bg-stone-50 px-4 h-10 rounded-xl border border-stone-100 focus-within:border-black focus-within:bg-white transition-all">
                  <Search className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    placeholder="Tìm mã đơn..."
                    className="bg-transparent border-none p-0 text-[11px] focus:outline-none font-bold uppercase tracking-widest focus:ring-0 w-full placeholder:text-stone-300"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")}>
                      <X className="w-3 h-3 text-stone-300 hover:text-black transition-colors" />
                    </button>
                  )}
                </div>
              </div>

              {/* Payment status */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                  Thanh toán
                </label>
                <Select
                  value={paymentStatusFilter}
                  onChange={(val) => { setPaymentStatusFilter(val); setPage(1); }}
                  options={[
                    { label: "Tất cả", value: "" },
                    ...PAYMENT_STATUS_OPTIONS,
                  ]}
                  className="h-10"
                />
              </div>

              {/* From date */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                  className="w-full h-10 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-bold focus:border-black focus:bg-white focus:ring-0 outline-none px-4 transition-all"
                />
              </div>

              {/* To date */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                  className="w-full h-10 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-bold focus:border-black focus:bg-white focus:ring-0 outline-none px-4 transition-all"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors"
              >
                <RefreshCcw className="w-3 h-3" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Order list ── */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-5">
          <Loader2 className="w-10 h-10 animate-spin text-stone-300" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 animate-pulse">
            Đang tải đơn hàng...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-stone-200">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-9 h-9 text-stone-200" />
          </div>
          <h3 className="text-base font-black text-black uppercase tracking-tight">
            Không có đơn hàng nào
          </h3>
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-2 text-center">
            {statusFilter
              ? "Không có đơn hàng ở trạng thái này."
              : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
          </p>
          {(statusFilter || hasActiveFilters) && (
            <button
              onClick={handleResetFilters}
              className="mt-6 px-8 py-3 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.18em] hover:scale-105 active:scale-95 transition-all"
            >
              Xem tất cả
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              variant="user"
              onCancel={handleCancelOrder}
              updatingId={cancellingId}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm gap-4">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
            {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)}{" "}
            / <span className="text-black">{totalItems}</span> đơn
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 border border-stone-100 text-stone-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-1.5 text-stone-300 text-xs">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-[10px] font-black transition-all",
                      page === p
                        ? "bg-black text-white shadow-md shadow-stone-200"
                        : "bg-white text-stone-400 hover:bg-stone-50 border border-stone-100",
                    )}
                  >
                    {p}
                  </button>
                </div>
              ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 border border-stone-100 text-stone-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {confirmDialog}
    </div>
  );
}
