"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { voucherApi } from "@/apis/voucher.api";
import { formatPrice, formatDate } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";
import { cn } from "@/utils/cn";

type VoucherStatus = "" | "ACTIVE" | "EXPIRED" | "USED_UP" | "DELETED";

type Voucher = {
  _id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  expiredAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
};

type FormState = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minOrderValue: string;
  maxDiscountAmount: string;
  usageLimit: string;
  expiredAt: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  discountType: "FIXED",
  discountValue: "",
  minOrderValue: "",
  maxDiscountAmount: "",
  usageLimit: "",
  expiredAt: "",
};

function getVoucherStatus(v: Voucher): {
  label: string;
  color: string;
} {
  if (v.deletedAt) return { label: "Đã xóa", color: "bg-red-100 text-red-600" };
  if (v.expiredAt && new Date() > new Date(v.expiredAt))
    return { label: "Hết hạn", color: "bg-orange-100 text-orange-600" };
  if (v.usageLimit != null && v.usedCount >= v.usageLimit)
    return { label: "Hết lượt", color: "bg-amber-100 text-amber-600" };
  return { label: "Còn hiệu lực", color: "bg-emerald-100 text-emerald-600" };
}

export default function VouchersPage() {
  const [data, setData] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VoucherStatus>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Voucher | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await voucherApi.list({ page, limit: 15, search: search || undefined, status: status || undefined });
      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, status]); // eslint-disable-line

  useEffect(() => { setPage(1); }, [search, status]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditTarget(v);
    setForm({
      code: v.code,
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      minOrderValue: v.minOrderValue != null ? String(v.minOrderValue) : "",
      maxDiscountAmount: v.maxDiscountAmount != null ? String(v.maxDiscountAmount) : "",
      usageLimit: v.usageLimit != null ? String(v.usageLimit) : "",
      expiredAt: v.expiredAt ? new Date(v.expiredAt).toISOString().slice(0, 10) : "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.code.trim()) return setFormError("Mã voucher không được để trống");
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return setFormError("Giá trị giảm phải lớn hơn 0");
    if (form.discountType === "PERCENTAGE" && Number(form.discountValue) > 100)
      return setFormError("Phần trăm giảm không được vượt quá 100");

    setSaving(true);
    try {
      const payload: any = {
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiredAt: form.expiredAt || null,
      };

      if (!editTarget) {
        payload.code = form.code.trim().toUpperCase();
        payload.discountType = form.discountType;
        await voucherApi.create(payload);
      } else {
        await voucherApi.update(editTarget._id, payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await voucherApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Ticket className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            Quản lý Voucher
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Tổng {totalItems} voucher
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Làm mới
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo voucher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Tìm mã voucher
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="Nhập mã voucher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VoucherStatus)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Còn hiệu lực</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="USED_UP">Hết lượt</option>
              <option value="DELETED">Đã xóa</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            className="py-2.5 px-5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Ticket className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có voucher nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã</th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loại / Giá trị</th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Min đơn</th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Lượt dùng</th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hết hạn</th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                  <th className="text-right py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map((v) => {
                  const st = getVoucherStatus(v);
                  const isDeleted = !!v.deletedAt;
                  return (
                    <tr
                      key={v._id}
                      className={cn(
                        "border-b border-slate-50 hover:bg-slate-50/70 transition-colors",
                        isDeleted && "opacity-50"
                      )}
                    >
                      <td className="py-3.5 px-4 font-black text-slate-900 tracking-wider">
                        {v.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {v.discountType === "FIXED"
                            ? formatPrice(v.discountValue)
                            : `${v.discountValue}%`}
                        </span>
                        {v.discountType === "PERCENTAGE" && v.maxDiscountAmount && (
                          <span className="ml-1.5 text-xs text-slate-400">
                            (tối đa {formatPrice(v.maxDiscountAmount)})
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                          {v.discountType === "FIXED" ? "Cố định" : "Phần trăm"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {v.minOrderValue != null ? formatPrice(v.minOrderValue) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{v.usedCount}</span>
                        {v.usageLimit != null ? (
                          <span className="text-slate-400"> / {v.usageLimit}</span>
                        ) : (
                          <span className="text-slate-400"> / ∞</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                        {v.expiredAt ? formatDate(v.expiredAt) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", st.color)}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDeleted && (
                            <>
                              <button
                                onClick={() => openEdit(v)}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Sửa"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(v)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                {editTarget ? "Sửa voucher" : "Tạo voucher mới"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 font-medium">
                  {formError}
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Mã voucher <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  disabled={!!editTarget}
                  placeholder="VD: SUMMER20"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {!editTarget && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Loại giảm giá <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "PERCENTAGE" | "FIXED" }))}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                  >
                    <option value="FIXED">Cố định (₫)</option>
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Giá trị giảm <span className="text-red-500">*</span>
                  <span className="ml-1 normal-case font-medium text-slate-300">
                    {form.discountType === "PERCENTAGE" ? "(%)" : "(₫)"}
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                />
              </div>

              {(editTarget?.discountType === "PERCENTAGE" || (!editTarget && form.discountType === "PERCENTAGE")) && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Giảm tối đa (₫)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))}
                    placeholder="Bỏ trống = không giới hạn"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Đơn tối thiểu (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderValue}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                    placeholder="Không giới hạn"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Giới hạn lượt
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="Vô hạn"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={form.expiredAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiredAt: e.target.value }))}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2.5 px-6 pb-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editTarget ? "Lưu thay đổi" : "Tạo voucher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Xóa voucher?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Voucher <span className="font-bold text-slate-700">{deleteTarget.code}</span> sẽ bị ẩn và không dùng được nữa.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
