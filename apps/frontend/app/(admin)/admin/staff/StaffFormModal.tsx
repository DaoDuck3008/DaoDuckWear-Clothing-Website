"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { userApi } from "@/apis/user.api";
import { handleApiError } from "@/utils/error.util";
import type {
  CreateStaffPayload,
  Staff,
  StaffEmploymentStatus,
  StaffGender,
  StaffRole,
  UpdateStaffPayload,
} from "@/types/staff";
import type { Shop } from "@/components/ui/ShopSelect";

interface StaffFormModalProps {
  open: boolean;
  editing: Staff | null;
  shops: Shop[];
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  username: string;
  email: string;
  role: StaffRole;
  shopId: string;
  fullName: string;
  dateOfBirth: string;
  gender: "" | StaffGender;
  nationalId: string;
  phone: string;
  hometown: string;
  permanentAddress: string;
  currentAddress: string;
  hireDate: string;
  employmentStatus: "" | StaffEmploymentStatus;
  position: string;
}

const EMPTY_FORM: FormState = {
  username: "",
  email: "",
  role: "STAFF",
  shopId: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  nationalId: "",
  phone: "",
  hometown: "",
  permanentAddress: "",
  currentAddress: "",
  hireDate: "",
  employmentStatus: "active",
  position: "",
};

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

export function StaffFormModal({
  open,
  editing,
  shops,
  onClose,
  onSaved,
}: StaffFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editing;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        username: editing.username,
        email: editing.email,
        role: editing.role?.name ?? "STAFF",
        shopId: editing.shop?.id ?? "",
        fullName: editing.fullName ?? "",
        dateOfBirth: toDateInput(editing.dateOfBirth),
        gender: (editing.gender as StaffGender) ?? "",
        nationalId: editing.nationalId ?? "",
        phone: editing.phone ?? "",
        hometown: editing.hometown ?? "",
        permanentAddress: editing.permanentAddress ?? "",
        currentAddress: editing.currentAddress ?? "",
        hireDate: toDateInput(editing.hireDate),
        employmentStatus:
          (editing.employmentStatus as StaffEmploymentStatus) ?? "active",
        position: editing.position ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editing]);

  if (!open) return null;

  const roleOptions: { value: StaffRole; label: string }[] = [
    { value: "ADMIN", label: "ADMIN" },
    { value: "MANAGER", label: "MANAGER" },
    { value: "STAFF", label: "STAFF" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    if (form.role !== "ADMIN" && !form.shopId) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    setSubmitting(true);
    try {
      const profile = {
        fullName: form.fullName.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        nationalId: form.nationalId.trim() || null,
        phone: form.phone.trim() || null,
        hometown: form.hometown.trim() || null,
        permanentAddress: form.permanentAddress.trim() || null,
        currentAddress: form.currentAddress.trim() || null,
        hireDate: form.hireDate || null,
        employmentStatus: form.employmentStatus || null,
        position: form.position.trim() || null,
      };

      if (isEdit && editing) {
        const payload: UpdateStaffPayload = {
          username: form.username.trim(),
          role: form.role,
          shopId: form.role === "ADMIN" ? null : form.shopId,
          ...profile,
        };
        await userApi.updateStaff(editing.id, payload);
        toast.success("Cập nhật nhân viên thành công");
      } else {
        const payload: CreateStaffPayload = {
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          shopId: form.role === "ADMIN" ? undefined : form.shopId,
          ...profile,
        };
        await userApi.createStaff(payload);
        toast.success(
          `Đã tạo nhân viên — mật khẩu tạm đã gửi tới ${payload.email}`,
        );
      }
      onSaved();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Tài khoản & phân quyền
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Tên đăng nhập"
                required
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
                placeholder="VD: nguyenvana"
              />
              <Field
                label="Email"
                required
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="example@daoduck.com"
                disabled={isEdit}
              />

              <SelectField
                label="Vai trò"
                value={form.role}
                onChange={(v) => setForm({ ...form, role: v as StaffRole })}
                options={roleOptions.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />

              {form.role !== "ADMIN" && (
                <SelectField
                  label="Chi nhánh"
                  required
                  value={form.shopId}
                  onChange={(v) => setForm({ ...form, shopId: v })}
                  options={shops.map((s) => ({ value: s.id, label: s.name }))}
                />
              )}
            </div>

            {!isEdit && (
              <p className="text-[11px] text-slate-400 italic">
                Mật khẩu sẽ được hệ thống tự sinh và gửi đến email của nhân
                viên.
              </p>
            )}
          </section>

          <section className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pt-4">
              Hồ sơ nhân viên
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Họ và tên"
                value={form.fullName}
                onChange={(v) => setForm({ ...form, fullName: v })}
                placeholder="VD: Nguyễn Văn A"
              />
              <Field
                label="Số điện thoại"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="VD: 0901234567"
              />

              <Field
                label="Ngày sinh"
                type="date"
                value={form.dateOfBirth}
                onChange={(v) => setForm({ ...form, dateOfBirth: v })}
              />
              <SelectField
                label="Giới tính"
                value={form.gender}
                onChange={(v) =>
                  setForm({ ...form, gender: v as StaffGender | "" })
                }
                options={[
                  { value: "", label: "— Không xác định —" },
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "other", label: "Khác" },
                ]}
              />

              <Field
                label="CCCD"
                value={form.nationalId}
                onChange={(v) => setForm({ ...form, nationalId: v })}
                placeholder="VD: 0xxxxxxxxxxx"
              />
              <Field
                label="Quê quán"
                value={form.hometown}
                onChange={(v) => setForm({ ...form, hometown: v })}
                placeholder="VD: Hà Nội"
              />

              <Field
                label="Địa chỉ thường trú"
                value={form.permanentAddress}
                onChange={(v) => setForm({ ...form, permanentAddress: v })}
                placeholder="Theo CCCD"
                fullWidth
              />
              <Field
                label="Địa chỉ hiện tại"
                value={form.currentAddress}
                onChange={(v) => setForm({ ...form, currentAddress: v })}
                placeholder="Nơi ở hiện tại"
                fullWidth
              />

              <Field
                label="Ngày vào làm"
                type="date"
                value={form.hireDate}
                onChange={(v) => setForm({ ...form, hireDate: v })}
              />
              <SelectField
                label="Trạng thái làm việc"
                value={form.employmentStatus}
                onChange={(v) =>
                  setForm({
                    ...form,
                    employmentStatus: v as StaffEmploymentStatus | "",
                  })
                }
                options={[
                  { value: "active", label: "Đang làm việc" },
                  { value: "onLeave", label: "Tạm nghỉ" },
                  { value: "terminated", label: "Đã nghỉ" },
                ]}
              />

              <Field
                label="Vị trí / Chức vụ"
                value={form.position}
                onChange={(v) => setForm({ ...form, position: v })}
                placeholder="VD: Nhân viên bán hàng"
                fullWidth
              />
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  disabled,
  fullWidth,
}: FieldProps) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  fullWidth,
}: SelectFieldProps) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
