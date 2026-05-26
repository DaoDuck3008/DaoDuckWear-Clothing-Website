"use client";

import { useEffect, useState } from "react";
import { Edit, Loader2, X } from "lucide-react";
import { userApi } from "@/apis/user.api";
import { handleApiError } from "@/utils/error.util";
import { cn } from "@/utils/cn";
import type {
  Staff,
  StaffEmploymentStatus,
  StaffGender,
  StaffRole,
} from "@/types/staff";

interface StaffDetailModalProps {
  open: boolean;
  staffId: string | null;
  onClose: () => void;
  onEdit?: (staff: Staff) => void;
}

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
  active: "Đang làm việc",
  onLeave: "Tạm nghỉ",
  terminated: "Đã nghỉ",
};

const GENDER_LABEL: Record<StaffGender, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
};

export function StaffDetailModal({
  open,
  staffId,
  onClose,
  onEdit,
}: StaffDetailModalProps) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !staffId) return;
    let cancelled = false;
    setLoading(true);
    setStaff(null);
    userApi
      .getStaffById(staffId)
      .then((data) => {
        if (!cancelled) setStaff(data);
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
  }, [open, staffId, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Chi tiết nhân viên
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chế độ chỉ xem
            </p>
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
          {loading || !staff ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              <p className="text-sm text-slate-500">Đang tải thông tin...</p>
            </div>
          ) : (
            <>
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Tài khoản & phân quyền
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailRow label="Tên đăng nhập" value={staff.username} />
                  <DetailRow label="Email" value={staff.email} />
                  <DetailRow
                    label="Vai trò"
                    value={
                      staff.role ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                            ROLE_BADGE[staff.role.name],
                          )}
                        >
                          {staff.role.name}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <DetailRow
                    label="Chi nhánh"
                    value={
                      staff.shop?.name ?? (
                        <span className="italic text-slate-400">
                          Toàn hệ thống
                        </span>
                      )
                    }
                  />
                  <DetailRow
                    label="Phương thức đăng nhập"
                    value={staff.provider.toUpperCase()}
                  />
                  <DetailRow
                    label="Trạng thái xác thực"
                    value={
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                          staff.isVerified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {staff.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                      </span>
                    }
                  />
                </dl>
              </section>

              <section className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pt-4">
                  Hồ sơ nhân viên
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailRow
                    label="Họ và tên"
                    value={staff.fullName || "—"}
                  />
                  <DetailRow label="Số điện thoại" value={staff.phone || "—"} />
                  <DetailRow
                    label="Ngày sinh"
                    value={formatDate(staff.dateOfBirth)}
                  />
                  <DetailRow
                    label="Giới tính"
                    value={
                      staff.gender ? GENDER_LABEL[staff.gender] : "—"
                    }
                  />
                  <DetailRow
                    label="CCCD"
                    value={staff.nationalId || "—"}
                  />
                  <DetailRow
                    label="Quê quán"
                    value={staff.hometown || "—"}
                  />
                  <DetailRow
                    label="Địa chỉ thường trú"
                    value={staff.permanentAddress || "—"}
                    fullWidth
                  />
                  <DetailRow
                    label="Địa chỉ hiện tại"
                    value={staff.currentAddress || "—"}
                    fullWidth
                  />
                  <DetailRow
                    label="Ngày vào làm"
                    value={formatDate(staff.hireDate)}
                  />
                  <DetailRow
                    label="Trạng thái làm việc"
                    value={
                      staff.employmentStatus ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                            EMPLOYMENT_BADGE[staff.employmentStatus],
                          )}
                        >
                          {EMPLOYMENT_LABEL[staff.employmentStatus]}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <DetailRow
                    label="Vị trí / Chức vụ"
                    value={staff.position || "—"}
                    fullWidth
                  />
                  <DetailRow
                    label="Ngày tạo tài khoản"
                    value={formatDate(staff.createdAt)}
                  />
                </dl>
              </section>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          {onEdit && staff && (
            <button
              type="button"
              onClick={() => onEdit(staff)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
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
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

function DetailRow({ label, value, fullWidth }: DetailRowProps) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 break-words">{value}</dd>
    </div>
  );
}
