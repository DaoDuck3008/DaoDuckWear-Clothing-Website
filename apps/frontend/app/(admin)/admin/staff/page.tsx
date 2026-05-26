"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  KeyRound,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { userApi } from "@/apis/user.api";
import { shopApi } from "@/apis/shop.api";
import { useAuthStore } from "@/stores/auth.store";
import { handleApiError } from "@/utils/error.util";
import { Select } from "@/components/ui/Select";
import { ShopSelect, type Shop } from "@/components/ui/ShopSelect";
import { cn } from "@/utils/cn";
import { useConfirm } from "@/hooks/useConfirm";
import type { Staff, StaffEmploymentStatus, StaffRole } from "@/types/staff";
import { StaffFormModal } from "./StaffFormModal";
import { StaffDetailModal } from "./StaffDetailModal";

const ROLE_BADGE: Record<StaffRole, string> = {
  ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
  MANAGER: "bg-indigo-50 text-indigo-700 border-indigo-200",
  STAFF: "bg-stone-100 text-stone-700 border-stone-200",
};

const EMPLOYMENT_BADGE: Record<StaffEmploymentStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  onLeave: "bg-amber-50 text-amber-700 border-amber-200",
  terminated: "bg-stone-100 text-stone-500 border-stone-200",
};

const EMPLOYMENT_LABEL: Record<StaffEmploymentStatus, string> = {
  active: "Đang làm",
  onLeave: "Tạm nghỉ",
  terminated: "Đã nghỉ",
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
};

export default function AdminStaffPage() {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirm();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const currentRole = (user?.role as StaffRole | undefined) ?? null;
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";
  const hasAccess = isAdmin || isManager;

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | StaffRole>("");
  const [shopFilter, setShopFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const isFiltered = useMemo(
    () => !!search.trim() || !!roleFilter || !!shopFilter,
    [search, roleFilter, shopFilter],
  );

  const roleOptions = useMemo(() => {
    const base = [{ value: "", label: "Tất cả vai trò" }];
    if (isAdmin) {
      return [
        ...base,
        { value: "ADMIN", label: "ADMIN" },
        { value: "MANAGER", label: "MANAGER" },
        { value: "STAFF", label: "STAFF" },
      ];
    }
    return [
      ...base,
      { value: "MANAGER", label: "MANAGER" },
      { value: "STAFF", label: "STAFF" },
    ];
  }, [isAdmin]);

  const fetchStaff = useCallback(async () => {
    if (!hasAccess) return;
    setLoading(true);
    try {
      const res = await userApi.getStaff({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        shopId: shopFilter || undefined,
        page,
        limit,
      });
      setStaff(res.data);
      setTotal(res.total);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [hasAccess, search, roleFilter, shopFilter, page, limit]);

  useEffect(() => {
    if (!hydrated) return;
    if (currentRole && !hasAccess) {
      router.replace("/admin");
      return;
    }
    if (isAdmin) {
      shopApi.getShops().then(setShops).catch(handleApiError);
    }
  }, [hydrated, currentRole, hasAccess, isAdmin, router]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleReset = () => {
    setSearch("");
    setRoleFilter("");
    setShopFilter("");
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSaved = () => {
    closeModal();
    fetchStaff();
  };

  const handleDelete = async (s: Staff) => {
    if (s.id === user?.id) {
      toast.error("Bạn không thể tự xóa tài khoản của mình");
      return;
    }
    const ok = await confirm({
      title: "Xóa nhân viên",
      description: `Bạn có chắc muốn xóa nhân viên "${s.fullName || s.username}"?`,
      confirmText: "Xóa",
    });
    if (!ok) return;
    try {
      await userApi.deleteStaff(s.id);
      toast.success("Đã xóa nhân viên");
      if (staff.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchStaff();
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleResetPassword = async (s: Staff) => {
    const ok = await confirm({
      title: "Đặt lại mật khẩu",
      description: `Hệ thống sẽ sinh mật khẩu mới và gửi tới ${s.email}. Tiếp tục?`,
      confirmText: "Gửi mật khẩu mới",
    });
    if (!ok) return;
    setResettingId(s.id);
    try {
      await userApi.resetStaffPassword(s.id);
      toast.success("Đã gửi mật khẩu mới tới email nhân viên");
    } catch (error) {
      handleApiError(error);
    } finally {
      setResettingId(null);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Quản lý nhân viên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Quản lý toàn bộ ADMIN, MANAGER và STAFF của hệ thống."
              : `Danh sách nhân viên trong chi nhánh${
                  user?.shop?.name ? `: ${user.shop.name}` : ""
                } (chỉ xem).`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm nhân viên
          </button>
        )}
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
            placeholder="Tìm theo tên, email, CCCD, SĐT..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
          />
        </div>

        <div className="md:col-span-3">
          <Select
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v as "" | StaffRole);
              setPage(1);
            }}
            options={roleOptions}
            placeholder="Vai trò"
          />
        </div>

        {isAdmin && (
          <div className="md:col-span-3">
            <ShopSelect
              value={shopFilter}
              onChange={(id) => {
                setShopFilter(id);
                setPage(1);
              }}
              shops={shops}
            />
          </div>
        )}

        {isFiltered && (
          <button
            onClick={handleReset}
            className="md:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="md:hidden">Đặt lại</span>
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
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              {isFiltered ? (
                <>
                  <p className="text-slate-900 font-semibold">
                    Không tìm thấy nhân viên
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                </>
              ) : (
                <>
                  <p className="text-slate-900 font-semibold">
                    Chưa có nhân viên nào
                  </p>
                  <p className="text-sm text-slate-500">
                    Nhấn &quot;Thêm nhân viên&quot; để bắt đầu.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <Th>Nhân viên</Th>
                  <Th>Vai trò</Th>
                  <Th>Chi nhánh</Th>
                  <Th>Vị trí</Th>
                  <Th>Trạng thái</Th>
                  <Th>Ngày vào làm</Th>
                  <Th className="text-right">Thao tác</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => {
                  const isSelf = s.id === user?.id;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {s.fullName || s.username}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                                (Bạn)
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500">
                            {s.email}
                          </span>
                          {s.phone && (
                            <span className="text-[11px] text-slate-400 mt-0.5">
                              {s.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {s.role ? (
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                              ROLE_BADGE[s.role.name],
                            )}
                          >
                            {s.role.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {s.shop ? (
                          <span className="text-sm text-slate-700">
                            {s.shop.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Toàn hệ thống
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {s.position || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {s.employmentStatus ? (
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                              EMPLOYMENT_BADGE[s.employmentStatus],
                            )}
                          >
                            {EMPLOYMENT_LABEL[s.employmentStatus]}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">
                          {formatDate(s.hireDate)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailId(s.id)}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEdit(s)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {s.provider === "local" && (
                                <button
                                  onClick={() => handleResetPassword(s)}
                                  disabled={resettingId === s.id}
                                  className="p-2 text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                  title="Gửi lại mật khẩu"
                                >
                                  {resettingId === s.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <KeyRound className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(s)}
                                disabled={isSelf}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                  isSelf
                                    ? "Không thể tự xóa"
                                    : "Xóa nhân viên"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
      {!loading && staff.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-slate-100 rounded-xl p-4 shadow-sm gap-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị{" "}
            <span className="text-slate-900">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
            </span>{" "}
            / <span className="text-slate-900">{total}</span> nhân viên
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

      {isAdmin && (
        <StaffFormModal
          open={showModal}
          editing={editing}
          shops={shops}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      <StaffDetailModal
        open={!!detailId}
        staffId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={
          isAdmin
            ? (s) => {
                setDetailId(null);
                openEdit(s);
              }
            : undefined
        }
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
