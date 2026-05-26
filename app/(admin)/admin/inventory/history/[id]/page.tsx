"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { inventoryApi } from "@/apis/inventory.api";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  Package,
  RotateCcw,
  ShieldOff,
  AlertTriangle,
  Calendar,
  User as UserIcon,
  Store,
  StickyNote,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDate, formatPrice } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";

export default function InventoryImportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeNote, setRevokeNote] = useState("");

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await inventoryApi.getImportDetail(id as string);
      setDoc(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRevoke = async () => {
    if (!doc) return;
    setRevoking(true);
    try {
      await inventoryApi.revokeImport(doc.id, { note: revokeNote.trim() || undefined });
      toast.success("Đã thu hồi phiếu nhập");
      setConfirming(false);
      setRevokeNote("");
      fetchDetail();
    } catch (error) {
      handleApiError(error);
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Đang tải chi tiết phiếu nhập...
        </p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Phiếu nhập không tồn tại.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-black font-bold uppercase text-xs flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  const isRevoked = doc.status === "REVOKED";
  const hasRole =
    user?.role === "ADMIN" ||
    (user?.role === "MANAGER" &&
      doc.shopId?._id?.toString() === user?.shopId);
  const canRevoke = !isRevoked && hasRole && doc.canRevoke !== false;
  const blockers: Array<{
    variantId: string;
    sku: string | null;
    needed: number;
    currentQuantity: number;
    reservedQuantity: number;
    shortage: number;
  }> = doc.revokeBlockers || [];

  let badgeClass = "bg-emerald-100 text-emerald-700";
  let badgeLabel = "Còn hiệu lực";
  let tooltipTitle = "";
  let tooltipLines: string[] = [];
  if (isRevoked) {
    badgeClass = "bg-red-100 text-red-600";
    badgeLabel = "Đã thu hồi";
    tooltipTitle = "Phiếu này đã bị thu hồi";
    tooltipLines = [
      `Bởi: ${
        doc.revokedBy?.fullName || doc.revokedBy?.username || "—"
      }`,
      `Lúc: ${doc.revokedAt ? formatDate(doc.revokedAt) : "—"}`,
      "Số lượng đã được trừ khỏi tồn kho.",
    ];
  } else if (doc.canRevoke === false) {
    badgeClass = "bg-amber-100 text-amber-700";
    badgeLabel = "Còn hiệu lực · không thu hồi được";
    tooltipTitle = "Không đủ tồn để thu hồi";
    tooltipLines = [
      "Một số biến thể đã được bán hoặc đang giữ chỗ trong đơn:",
      ...blockers.map(
        (b) =>
          `• ${b.sku || b.variantId.slice(-6)}: tồn ${b.currentQuantity} - nhập ${b.needed} < giữ chỗ ${b.reservedQuantity} (thiếu ${b.shortage})`,
      ),
    ];
  } else {
    tooltipTitle = "Phiếu còn hiệu lực";
    tooltipLines = [
      hasRole
        ? "Tồn kho đủ — bạn có thể thu hồi phiếu này."
        : "Bạn không có quyền thu hồi phiếu của chi nhánh khác.",
    ];
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-outfit">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none flex items-center gap-3">
              Phiếu nhập
              <code className="text-base bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-mono">
                #{String(doc.id).slice(-6).toUpperCase()}
              </code>
              <span
                tabIndex={0}
                className={cn(
                  "relative inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest cursor-help group/badge",
                  badgeClass,
                )}
              >
                {badgeLabel}
                <span className="pointer-events-none absolute top-full left-0 mt-2 w-80 z-30 opacity-0 translate-y-1 group-hover/badge:opacity-100 group-hover/badge:translate-y-0 group-focus/badge:opacity-100 group-focus/badge:translate-y-0 transition-all duration-150 bg-slate-900 text-white rounded-xl shadow-2xl p-3 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-widest mb-1.5">
                    {tooltipTitle}
                  </span>
                  <span className="block text-[11px] font-medium normal-case tracking-normal text-slate-200 whitespace-pre-line">
                    {tooltipLines.join("\n")}
                  </span>
                </span>
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Chi tiết các biến thể được nhập trong phiếu này.
            </p>
          </div>
        </div>
        {!isRevoked && hasRole && (
          <button
            onClick={() => setConfirming(true)}
            disabled={!canRevoke}
            title={!canRevoke ? tooltipLines.join("\n") : undefined}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all",
              canRevoke
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
            )}
          >
            <RotateCcw className="w-4 h-4" />
            Thu hồi phiếu
          </button>
        )}
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetaCard
          icon={<Calendar className="w-4 h-4" />}
          label="Ngày tạo"
          value={formatDate(doc.createdAt)}
        />
        <MetaCard
          icon={<UserIcon className="w-4 h-4" />}
          label="Người tạo"
          value={doc.createdBy?.fullName || doc.createdBy?.username || "—"}
        />
        <MetaCard
          icon={<Store className="w-4 h-4" />}
          label="Chi nhánh"
          value={doc.shopId?.name || "—"}
        />
        <MetaCard
          icon={<Package className="w-4 h-4" />}
          label="Tổng số lượng"
          value={`+${doc.totalQuantity}`}
          highlight
        />
      </div>

      {/* Revocation info */}
      {isRevoked && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
          <ShieldOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-black text-red-700 uppercase tracking-widest">
              Phiếu đã thu hồi
            </p>
            <p className="text-xs text-red-600 mt-1">
              Thu hồi bởi{" "}
              <strong>
                {doc.revokedBy?.fullName || doc.revokedBy?.username || "—"}
              </strong>{" "}
              vào {doc.revokedAt ? formatDate(doc.revokedAt) : "—"}.
            </p>
          </div>
        </div>
      )}

      {/* Note */}
      {doc.note && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-3 shadow-sm">
          <StickyNote className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Ghi chú
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {doc.note}
            </p>
          </div>
        </div>
      )}

      {/* Product */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
            {doc.productId?.images?.[0]?.url ? (
              <img
                src={doc.productId.images[0].url}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-200" />
              </div>
            )}
          </div>
          <div>
            <p className="text-base font-black text-slate-900 uppercase tracking-tight">
              {doc.productId?.name || "—"}
            </p>
            <code className="text-[11px] text-slate-500 font-mono">
              {doc.productId?.slug || ""}
            </code>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
            Chi tiết biến thể ({doc.items?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4 text-left">Biến thể</th>
                <th className="py-3 px-4 text-left">SKU</th>
                <th className="py-3 px-4 text-right">Giá</th>
                <th className="py-3 px-4 text-right">Tồn hiện tại</th>
                <th className="py-3 px-4 text-right">Số lượng nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(doc.items || []).map((item: any, idx: number) => {
                const variant = item.variantId || {};
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                          {variant.image ? (
                            <img
                              src={variant.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-200" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase">
                          {variant.color || "—"} / {variant.size || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-[10px] font-black bg-slate-50 px-2 py-1 rounded text-slate-600 font-mono">
                        {item.sku || variant.sku || "—"}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-bold text-slate-600">
                      {variant.price ? formatPrice(variant.price) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-black text-slate-900">
                        {item.currentQuantity ?? "—"}
                      </span>
                      {(item.reservedQuantity ?? 0) > 0 && (
                        <span className="block text-[10px] font-bold text-orange-500">
                          giữ chỗ: {item.reservedQuantity}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-black text-emerald-600">
                      +{item.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-100">
                <td
                  colSpan={4}
                  className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500"
                >
                  Tổng cộng
                </td>
                <td className="py-3 px-4 text-right text-base font-black text-emerald-600">
                  +{doc.totalQuantity}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Xác nhận thu hồi
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Hệ thống sẽ trừ lại{" "}
                  <strong className="text-red-600">
                    {doc.totalQuantity} sản phẩm
                  </strong>{" "}
                  từ tồn kho hiện tại. Nếu không đủ tồn (đã bán hoặc đang giữ
                  chỗ), thao tác sẽ bị từ chối.
                </p>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Lý do (tuỳ chọn)
              </label>
              <textarea
                value={revokeNote}
                onChange={(e) => setRevokeNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="VD: nhập nhầm sản phẩm, sai số lượng..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-black text-sm font-medium resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={revoking}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {revoking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Xác nhận thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        highlight
          ? "bg-emerald-50 border-emerald-100"
          : "bg-white border-slate-100",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1.5",
          highlight ? "text-emerald-600" : "text-slate-400",
        )}
      >
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "text-base font-black uppercase tracking-tight",
          highlight ? "text-emerald-700" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
