"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { updateProfile, uploadAvatar, getProfile, changePassword } from "@/apis/auth.api";
import { ChangePasswordForm } from "@/types/auth.type";
import { passwordStrengthRules } from "@/validators/register.validator";
import { orderApi } from "@/apis/order.api";
import { handleApiError } from "@/utils/error.util";
import { toast } from "react-toastify";
import ModalPortal from "@/components/ui/modalPortal";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  Camera,
  Loader2,
  X,
  Pencil,
  Lock,
  Eye,
  EyeOff,
  ShoppingCart,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = [
  {
    key: "PENDING",
    short: "Chờ xử lý",
    Icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    key: "CONFIRMED",
    short: "Xác nhận",
    Icon: PackageCheck,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    key: "SHIPPING",
    short: "Giao hàng",
    Icon: Truck,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    key: "COMPLETED",
    short: "Hoàn thành",
    Icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    key: "CANCELLED",
    short: "Đã hủy",
    Icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-50",
  },
];

const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
  USER: { label: "Khách hàng", cls: "bg-stone-100 text-stone-600" },
  ADMIN: { label: "Quản trị viên", cls: "bg-rose-100 text-rose-600" },
  SELLER: { label: "Người bán", cls: "bg-sky-100 text-sky-600" },
};

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const cartCount = useCartStore((state) => state.totalItems());

  const [createdAt, setCreatedAt] = useState<string>();
  const [provider, setProvider] = useState<string>("local");
  const [orderStats, setOrderStats] = useState<Record<string, number>>({});
  const [statsLoading, setStatsLoading] = useState(true);

  // edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    phone?: string;
  }>({});

  // avatar upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // change password modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [cpForm, setCpForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [cpErrors, setCpErrors] = useState<Partial<Record<keyof ChangePasswordForm, string>>>({});
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpShowConfirm, setCpShowConfirm] = useState(false);
  const [cpNewFocused, setCpNewFocused] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    getProfile()
      .then((res) => {
        setCreatedAt(res.data.createdAt);
        setProvider(res.data.provider || "local");
      })
      .catch(() => {});

    Promise.all(
      STATUS_CONFIG.map((s) =>
        orderApi
          .getMyOrders({ status: s.key, limit: 1 })
          .catch(() => ({ data: { totalItems: 0 } }))
      )
    )
      .then((results) => {
        const stats: Record<string, number> = {};
        STATUS_CONFIG.forEach((s, i) => {
          stats[s.key] = results[i].data?.totalItems ?? 0;
        });
        setOrderStats(stats);
      })
      .finally(() => setStatsLoading(false));
  }, []);

  // ── helpers ─────────────────────────────────────────────────────────────────
  const role =
    ROLE_CONFIG[user?.role ?? ""] ?? {
      label: user?.role ?? "Khách hàng",
      cls: "bg-stone-100 text-stone-600",
    };

  const openEdit = () => {
    setUsername(user?.username || "");
    setPhone(user?.phone || "");
    setFieldErrors({});
    setIsEditOpen(true);
  };

  const validate = () => {
    const e: typeof fieldErrors = {};
    if (!username.trim()) e.username = "Tên không được để trống";
    else if (username.trim().length < 2) e.username = "Tên phải có ít nhất 2 ký tự";
    if (phone && !/^(0|\+84)[0-9]{8,9}$/.test(phone))
      e.phone = "Số điện thoại không hợp lệ";
    return e;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        username: username.trim(),
        phone: phone.trim() || undefined,
      });
      updateUser({ username: res.data.username, phone: res.data.phone });
      toast.success("Cập nhật thành công!");
      setIsEditOpen(false);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCp = () => {
    const e: Partial<Record<keyof ChangePasswordForm, string>> = {};
    if (!cpForm.currentPassword) e.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!cpForm.newPassword) e.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (cpForm.newPassword.length < 6) e.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    else if (!/[A-Z]/.test(cpForm.newPassword)) e.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ in hoa";
    else if (!/\d/.test(cpForm.newPassword)) e.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ số";
    if (!cpForm.confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    else if (cpForm.newPassword !== cpForm.confirmPassword) e.confirmPassword = "Mật khẩu xác nhận không khớp";
    return e;
  };

  const handleChangePassword = async () => {
    const errors = validateCp();
    if (Object.keys(errors).length) {
      setCpErrors(errors);
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(cpForm);
      toast.success("Đổi mật khẩu thành công!");
      setIsChangePasswordOpen(false);
      setCpForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setCpErrors({});
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      updateUser({ avatar: res.data.avatar });
      toast.success("Ảnh đại diện đã được cập nhật!");
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4">

      {/* ╔══ Profile card ═════════════════════════════════════════════════════╗ */}
      <div className="bg-white border border-stone-100 shadow-sm">
        <div className="p-6 sm:p-8">

          {/* Avatar + identity */}
          <div className="flex items-start gap-5">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
            >
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden ring-2 ring-stone-100 group-hover:ring-stone-200 transition-all">
                {isUploadingAvatar ? (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-5 h-5 text-stone-300 animate-spin" />
                  </div>
                ) : (
                  <UserAvatar
                    avatar={user?.avatar}
                    username={user?.username}
                    className="w-full h-full text-xl"
                  />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-black uppercase tracking-tight leading-none">
                  {user?.username || "—"}
                </h2>
                <span
                  className={`px-2.5 py-[3px] rounded-full text-[9px] font-black uppercase tracking-widest ${role.cls}`}
                >
                  {role.label}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 truncate">{user?.email || "—"}</p>
              <p className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.15em] mt-1.5">
                Nhấn ảnh để thay đổi
              </p>
            </div>
          </div>

          {/* Info strip */}
          <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3 py-4 border-y border-stone-100">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3 text-stone-300" />
                <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
                  Email
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-700 truncate">
                {user?.email || "—"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-stone-300" />
                <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
                  Điện thoại
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-700">
                {user?.phone || (
                  <span className="text-stone-300 italic font-medium">Chưa có</span>
                )}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays className="w-3 h-3 text-stone-300" />
                <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
                  Tham gia
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-700">{fmtDate(createdAt)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-black transition-all text-[11px] font-black uppercase tracking-[0.12em]"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Giỏ hàng
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[9px] font-black">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={openEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-stone-800 active:scale-[0.99] transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Cập nhật thông tin
            </button>

            {provider !== "google" && (
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-black transition-all text-[11px] font-black uppercase tracking-[0.12em]"
              >
                <Lock className="w-3.5 h-3.5" />
                Đổi mật khẩu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ╔══ Order stats card ══════════════════════════════════════════════════╗ */}
      <div className="bg-white border border-stone-100 shadow-sm">
        <div className="px-6 sm:px-8 pt-6 pb-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.2em]">
              Đơn hàng của tôi
            </h3>
            <Link
              href="/profile/orders"
              className="flex items-center gap-0.5 text-[10px] font-bold text-stone-400 hover:text-black transition-colors uppercase tracking-widest"
            >
              Tất cả
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-5">
            {STATUS_CONFIG.map(({ key, short, Icon, color, bg }, idx) => (
              <Link
                key={key}
                href={`/profile/orders?status=${key}`}
                className={`group flex flex-col items-center gap-2.5 py-4 px-1 transition-all hover:bg-stone-50 ${
                  idx < STATUS_CONFIG.length - 1
                    ? "border-r border-stone-100"
                    : ""
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center ${bg} group-hover:scale-105 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span
                  className={`text-2xl font-black leading-none transition-colors ${
                    statsLoading ? "text-stone-200 animate-pulse" : "text-stone-900"
                  }`}
                >
                  {statsLoading ? "–" : (orderStats[key] ?? 0)}
                </span>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide text-center leading-tight px-1">
                  {short}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ╔══ Change password modal ════════════════════════════════════════════╗ */}
      {isChangePasswordOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => !isChangingPassword && setIsChangePasswordOpen(false)}
            />
            <div className="relative bg-white w-full max-w-md shadow-2xl shadow-stone-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="h-1.5 w-full" style={{ backgroundColor: "#b91446" }} />
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-black uppercase tracking-tight">
                    Đổi mật khẩu
                  </h3>
                  <button
                    onClick={() => !isChangingPassword && setIsChangePasswordOpen(false)}
                    className="p-2 text-stone-300 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Current password */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.18em]">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={cpShowCurrent ? "text" : "password"}
                      value={cpForm.currentPassword}
                      onChange={(e) => {
                        setCpForm((p) => ({ ...p, currentPassword: e.target.value }));
                        setCpErrors((p) => ({ ...p, currentPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-b border-stone-200 focus:border-black py-3 outline-none text-sm transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowCurrent((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                    >
                      {cpShowCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {cpErrors.currentPassword && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                      {cpErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New password */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.18em]">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={cpShowNew ? "text" : "password"}
                      value={cpForm.newPassword}
                      onChange={(e) => {
                        setCpForm((p) => ({ ...p, newPassword: e.target.value }));
                        setCpErrors((p) => ({ ...p, newPassword: undefined }));
                      }}
                      onFocus={() => setCpNewFocused(true)}
                      onBlur={() => setCpNewFocused(false)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-b border-stone-200 focus:border-black py-3 outline-none text-sm transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowNew((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                    >
                      {cpShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {cpErrors.newPassword && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                      {cpErrors.newPassword}
                    </p>
                  )}
                  {(cpNewFocused || cpForm.newPassword.length > 0) && (
                    <div className="pt-1 flex flex-wrap gap-x-4 gap-y-2">
                      {passwordStrengthRules.map((rule) => {
                        const passed = rule.test(cpForm.newPassword);
                        return (
                          <div
                            key={rule.label}
                            className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest ${passed ? "text-black" : "text-stone-300"}`}
                          >
                            <div className={`w-1 h-1 rounded-full ${passed ? "bg-black" : "bg-stone-200"}`} />
                            {rule.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.18em]">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={cpShowConfirm ? "text" : "password"}
                      value={cpForm.confirmPassword}
                      onChange={(e) => {
                        setCpForm((p) => ({ ...p, confirmPassword: e.target.value }));
                        setCpErrors((p) => ({ ...p, confirmPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-b border-stone-200 focus:border-black py-3 outline-none text-sm transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowConfirm((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                    >
                      {cpShowConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {cpErrors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                      {cpErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsChangePasswordOpen(false)}
                    disabled={isChangingPassword}
                    className="flex-1 py-3.5 border border-stone-200 text-[11px] font-black uppercase tracking-[0.15em] text-stone-400 hover:border-stone-300 hover:text-stone-600 transition-all disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex-1 py-3.5 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-stone-800 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ╔══ Edit modal ════════════════════════════════════════════════════════╗ */}
      {isEditOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsEditOpen(false)}
            />
            <div className="relative bg-white w-full max-w-md shadow-2xl shadow-stone-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: "#b91446" }}
              />
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-black uppercase tracking-tight">
                    Cập nhật thông tin
                  </h3>
                  <button
                    onClick={() => !isSubmitting && setIsEditOpen(false)}
                    className="p-2 text-stone-300 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.18em]">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setFieldErrors((p) => ({ ...p, username: undefined }));
                    }}
                    placeholder="Nhập tên của bạn"
                    className="w-full bg-transparent border-b border-stone-200 focus:border-black py-3 outline-none text-sm transition-colors"
                  />
                  {fieldErrors.username && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.18em]">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFieldErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    placeholder="0xxxxxxxxx"
                    className="w-full bg-transparent border-b border-stone-200 focus:border-black py-3 outline-none text-sm transition-colors"
                  />
                  {fieldErrors.phone && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 border border-stone-200 text-[11px] font-black uppercase tracking-[0.15em] text-stone-400 hover:border-stone-300 hover:text-stone-600 transition-all disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-stone-800 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
