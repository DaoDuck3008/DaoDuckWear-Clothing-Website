"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/apis/order.api";
import { toast } from "react-toastify";
import {
  Search,
  ShoppingBag,
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { OrderCard } from "@/components/order/OrderCard";
import { cn } from "@/utils/cn";
import { handleApiError } from "@/utils/error.util";
import { Select } from "@/components/ui/Select";
import { ShopSelect } from "@/components/ui/ShopSelect";
import { shopApi } from "@/apis/shop.api";
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/constants/order";
import { useAuthStore } from "@/stores/auth.store";
import { useConfirm } from "@/hooks/useConfirm";

export default function OrdersManagementPage() {
  const { confirm, confirmDialog } = useConfirm();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(true);

  const user = useAuthStore((state) => state.user);

  const activeFilterCount = [
    statusFilter,
    paymentStatusFilter,
    paymentMethodFilter,
    selectedShopId,
    fromDate,
    toDate,
    searchTerm,
  ].filter(Boolean).length;

  useEffect(() => {
    if (user?.role === "ADMIN") {
      shopApi.getShops().then((data) => setShops(data));
    }
  }, [user]);

  const fetchOrders = async () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      toast.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setLoading(true);
    try {
      const res = await orderApi.getAdminOrders({
        orderCode: searchTerm.startsWith("#")
          ? searchTerm.slice(1)
          : searchTerm,
        phone:
          !searchTerm.startsWith("#") && /^[0-9]+$/.test(searchTerm)
            ? searchTerm
            : undefined,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        paymentMethod: paymentMethodFilter,
        shopId: selectedShopId || undefined,
        fromDate,
        toDate,
        page,
        limit,
      });
      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) return;
    fetchOrders();
  }, [
    statusFilter,
    paymentStatusFilter,
    paymentMethodFilter,
    selectedShopId,
    fromDate,
    toDate,
    page,
    limit,
    searchTerm,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setPaymentMethodFilter("");
    setSelectedShopId("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const ok = await confirm({
      title: "Cập nhật trạng thái đơn",
      description: `Chuyển trạng thái đơn hàng sang "${STATUS_LABELS[newStatus]}"?`,
      confirmText: "Cập nhật",
    });
    if (!ok) return;

    setUpdating(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdating(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const ok = await confirm({
      title: "Hủy đơn hàng",
      description:
        "Bạn có chắc muốn hủy đơn hàng này? Thao tác này sẽ hoàn lại số lượng tồn kho.",
      confirmText: "Hủy đơn",
    });
    if (!ok) return;

    setUpdating(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, "CANCELLED");
      toast.success("Đã hủy đơn hàng");
      fetchOrders();
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto font-outfit pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            Quản lý Đơn hàng
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {user?.shop?.name
              ? `Chi nhánh: ${user.shop.name}`
              : "Theo dõi và xử lý trạng thái đơn hàng."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black rounded-xl transition-all shadow-sm"
            title="Làm mới"
          >
            <RefreshCcw
              className={cn("w-4 h-4", loading && "animate-spin")}
            />
          </button>
          {/* Toggle filter button — shows on mobile, with badge */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest shadow-sm",
              filterOpen
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black",
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span
                className={cn(
                  "w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center",
                  filterOpen ? "bg-white text-slate-900" : "bg-slate-900 text-white",
                )}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && totalItems > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Tổng đơn hàng",
              value: totalItems,
              color: "text-slate-900",
              bg: "bg-white",
            },
            {
              label: "Trang hiện tại",
              value: `${page} / ${totalPages}`,
              color: "text-slate-700",
              bg: "bg-white",
            },
            {
              label: "Bộ lọc đang dùng",
              value: activeFilterCount > 0 ? `${activeFilterCount} filter` : "Không có",
              color: activeFilterCount > 0 ? "text-amber-600" : "text-slate-400",
              bg: "bg-white",
            },
            {
              label: "Hiển thị",
              value: `${Math.min((page - 1) * limit + 1, totalItems)}–${Math.min(page * limit, totalItems)}`,
              color: "text-slate-700",
              bg: "bg-white",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-xl border border-slate-100 px-4 py-3 shadow-sm",
                stat.bg,
              )}
            >
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className={cn("text-base font-black", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      <div
        className={cn(
          "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300",
          filterOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 border-transparent shadow-none",
        )}
      >
        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="sm:col-span-2 space-y-1.5"
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Tìm kiếm
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  placeholder="Mã đơn (#...) hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-sm transition-all font-medium"
                />
              </div>
            </form>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Trạng thái đơn
              </label>
              <Select
                value={statusFilter}
                onChange={(val) => { setStatusFilter(val); setPage(1); }}
                options={STATUS_OPTIONS}
                placeholder="Tất cả"
              />
            </div>

            {/* Payment status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Thanh toán
              </label>
              <Select
                value={paymentStatusFilter}
                onChange={(val) => { setPaymentStatusFilter(val); setPage(1); }}
                options={PAYMENT_STATUS_OPTIONS}
                placeholder="Tất cả"
              />
            </div>

            {/* Payment method */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Phương thức
              </label>
              <Select
                value={paymentMethodFilter}
                onChange={(val) => { setPaymentMethodFilter(val); setPage(1); }}
                options={PAYMENT_METHOD_OPTIONS}
                placeholder="Tất cả"
              />
            </div>

            {/* Shop select (ADMIN only) */}
            {user?.role === "ADMIN" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Chi nhánh
                </label>
                <ShopSelect
                  value={selectedShopId}
                  onChange={(id) => { setSelectedShopId(id); setPage(1); }}
                  shops={shops}
                />
              </div>
            )}

            {/* Date range */}
            <div
              className={cn(
                "grid grid-cols-2 gap-3 sm:col-span-2",
                user?.role === "ADMIN" ? "lg:col-span-2" : "lg:col-span-2",
              )}
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-xs font-bold transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-xs font-bold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Reset row */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
              >
                <X className="w-3 h-3" />
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading && (!orders || orders.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
            <ShoppingBag className="w-16 h-16 opacity-20" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">
              Không có đơn hàng nào
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-black text-slate-400 hover:text-black uppercase tracking-widest underline underline-offset-4 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                variant="admin"
                onUpdateStatus={updateStatus}
                onCancel={cancelOrder}
                updatingId={updating}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && orders && orders.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-slate-100 rounded-2xl p-5 shadow-sm gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] order-2 md:order-1">
            Hiển thị{" "}
            <span className="text-slate-900">
              {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)}
            </span>{" "}
            / <span className="text-slate-900">{totalItems}</span> đơn hàng
          </div>

          <div className="flex items-center gap-2 order-1 md:order-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-slate-200 text-xs">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-9 h-9 rounded-xl text-[10px] font-black transition-all",
                        page === p
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100",
                      )}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 order-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mỗi trang
            </span>
            <Select
              value={limit.toString()}
              onChange={(val) => { setLimit(Number(val)); setPage(1); }}
              options={[
                { label: "10", value: "10" },
                { label: "20", value: "20" },
                { label: "50", value: "50" },
              ]}
              className="w-20"
            />
          </div>
        </div>
      )}

      {confirmDialog}
    </div>
  );
}
