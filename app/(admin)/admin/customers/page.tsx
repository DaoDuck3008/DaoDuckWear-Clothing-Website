"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Lock,
  RotateCcw,
  Search,
  Unlock,
  User as UserIcon,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { customerApi } from "@/apis/customer.api";
import { useAuthStore } from "@/stores/auth.store";
import { handleApiError } from "@/utils/error.util";
import { formatDate } from "@/utils/format.util";
import { Select } from "@/components/ui/Select";
import { cn } from "@/utils/cn";
import { useConfirm } from "@/hooks/useConfirm";
import type { Customer, CustomerProvider } from "@/types/customer";
import { CustomerDetailModal } from "./CustomerDetailModal";

const PROVIDER_BADGE: Record<CustomerProvider, string> = {
  local: "bg-slate-100 text-slate-700 border-slate-200",
  google: "bg-rose-50 text-rose-700 border-rose-200",
  facebook: "bg-blue-50 text-blue-700 border-blue-200",
};

const PROVIDER_LABEL: Record<CustomerProvider, string> = {
  local: "Email",
  google: "Google",
  facebook: "Facebook",
};

export default function AdminCustomersPage() {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirm();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const isAdmin = user?.role === "ADMIN";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [lockedFilter, setLockedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const isFiltered = useMemo(
    () =>
      !!search.trim() ||
      !!providerFilter ||
      !!verifiedFilter ||
      !!lockedFilter,
    [search, providerFilter, verifiedFilter, lockedFilter],
  );

  const fetchCustomers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await customerApi.getCustomers({
        search: search.trim() || undefined,
        provider: (providerFilter as CustomerProvider) || undefined,
        isVerified:
          verifiedFilter === "1" || verifiedFilter === "0"
            ? (verifiedFilter as "0" | "1")
            : undefined,
        isLocked:
          lockedFilter === "1" || lockedFilter === "0"
            ? (lockedFilter as "0" | "1")
            : undefined,
        page,
        limit,
      });
      setCustomers(res.data);
      setTotal(res.total);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, providerFilter, verifiedFilter, lockedFilter, page, limit]);

  useEffect(() => {
    if (!hydrated) return;
    if (user && !isAdmin) {
      router.replace("/admin");
    }
  }, [hydrated, user, isAdmin, router]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleReset = () => {
    setSearch("");
    setProviderFilter("");
    setVerifiedFilter("");
    setLockedFilter("");
    setPage(1);
  };

  const handleLockToggle = async (c: Customer) => {
    const willLock = !c.isLocked;
    const ok = await confirm({
      title: willLock ? "Khóa tài khoản" : "Mở khóa tài khoản",
      description: willLock
        ? `Tài khoản "${c.username}" sẽ không thể đăng nhập cho đến khi được mở khóa.`
        : `Tài khoản "${c.username}" sẽ có thể đăng nhập trở lại.`,
      confirmText: willLock ? "Khóa" : "Mở khóa",
    });
    if (!ok) return;
    setLockingId(c.id);
    try {
      const updated = willLock
        ? await customerApi.lockCustomer(c.id)
        : await customerApi.unlockCustomer(c.id);
      setCustomers((prev) =>
        prev.map((it) => (it.id === c.id ? updated : it)),
      );
      toast.success(willLock ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
    } catch (error) {
      handleApiError(error);
    } finally {
      setLockingId(null);
    }
  };

  const handleDetailLockChanged = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((it) => (it.id === updated.id ? updated : it)),
    );
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Quản lý khách hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Toàn bộ tài khoản khách đã đăng ký trên hệ thống.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <Select
            value={providerFilter}
            onChange={(v) => {
              setProviderFilter(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả phương thức" },
              { value: "local", label: "Email / Mật khẩu" },
              { value: "google", label: "Google" },
              { value: "facebook", label: "Facebook" },
            ]}
            placeholder="Phương thức"
          />
        </div>

        <div className="md:col-span-2">
          <Select
            value={verifiedFilter}
            onChange={(v) => {
              setVerifiedFilter(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả xác thực" },
              { value: "1", label: "Đã xác thực" },
              { value: "0", label: "Chưa xác thực" },
            ]}
            placeholder="Xác thực"
          />
        </div>

        <div className="md:col-span-2">
          <Select
            value={lockedFilter}
            onChange={(v) => {
              setLockedFilter(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "0", label: "Đang hoạt động" },
              { value: "1", label: "Đã khóa" },
            ]}
            placeholder="Trạng thái"
          />
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="md:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-sm text-slate-500 font-medium">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              {isFiltered ? (
                <>
                  <p className="text-slate-900 font-semibold">
                    Không tìm thấy khách hàng
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                </>
              ) : (
                <p className="text-slate-900 font-semibold">
                  Chưa có khách hàng nào
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <Th>Khách hàng</Th>
                  <Th>Số điện thoại</Th>
                  <Th>Địa chỉ</Th>
                  <Th>Phương thức</Th>
                  <Th>Xác thực</Th>
                  <Th>Trạng thái</Th>
                  <Th>Ngày tạo</Th>
                  <Th className="text-right">Thao tác</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const primaryPhone = c.addresses[0]?.phone ?? null;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                            {c.avatar ? (
                              <Image
                                src={c.avatar}
                                alt={c.username}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <UserIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {c.username}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {primaryPhone ?? (
                            <span className="text-slate-400">—</span>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {c.addresses.length > 0
                            ? `${c.addresses.length} địa chỉ`
                            : "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                            PROVIDER_BADGE[c.provider],
                          )}
                        >
                          {PROVIDER_LABEL[c.provider]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                            c.isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {c.isVerified ? "Đã xác thực" : "Chưa"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                            c.isLocked
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200",
                          )}
                        >
                          {c.isLocked ? "Đã khóa" : "Hoạt động"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">
                          {formatDate(c.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailId(c.id)}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLockToggle(c)}
                            disabled={lockingId === c.id}
                            className={cn(
                              "p-2 transition-colors disabled:opacity-50",
                              c.isLocked
                                ? "text-emerald-500 hover:text-emerald-700"
                                : "text-slate-400 hover:text-rose-600",
                            )}
                            title={
                              c.isLocked
                                ? "Mở khóa tài khoản"
                                : "Khóa tài khoản"
                            }
                          >
                            {lockingId === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : c.isLocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && customers.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-slate-100 rounded-xl p-4 shadow-sm gap-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị{" "}
            <span className="text-slate-900">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
            </span>{" "}
            / <span className="text-slate-900">{total}</span> khách hàng
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Mỗi trang
            </span>
            <Select
              value={limit.toString()}
              onChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
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

      <CustomerDetailModal
        open={!!detailId}
        customerId={detailId}
        onClose={() => setDetailId(null)}
        onLockChanged={handleDetailLockChanged}
      />

      {confirmDialog}
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500",
        className,
      )}
    >
      {children}
    </th>
  );
}
