"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCcw,
  Search,
  ScrollText,
  X,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { auditLogApi } from "@/apis/auditLog.api";
import { formatDate } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";
import { cn } from "@/utils/cn";

type AuditLogUser = {
  _id: string;
  username: string;
  email: string;
  avatar?: string | null;
};

type AuditLog = {
  _id: string;
  userId?: AuditLogUser | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  createdAt: string;
};

const ENTITY_NAMES = [
  "User",
  "Product",
  "Order",
  "Voucher",
  "Shop",
  "Banner",
  "Category",
  "Inventory",
  "Role",
];

function getActionStyle(action: string): string {
  const upper = action.toUpperCase();
  if (upper.startsWith("CREATE")) return "bg-emerald-100 text-emerald-700";
  if (upper.startsWith("UPDATE") || upper.startsWith("EDIT"))
    return "bg-blue-100 text-blue-700";
  if (upper.startsWith("DELETE") || upper.startsWith("REMOVE"))
    return "bg-red-100 text-red-700";
  if (upper.startsWith("LOGIN")) return "bg-violet-100 text-violet-700";
  if (upper.startsWith("LOGOUT")) return "bg-slate-100 text-slate-600";
  if (upper.includes("CANCEL")) return "bg-orange-100 text-orange-700";
  if (upper.includes("STATUS") || upper.includes("APPROVE"))
    return "bg-amber-100 text-amber-700";
  if (upper.includes("LOCK") || upper.includes("SUSPEND"))
    return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function JsonView({ data }: { data: Record<string, any> | null | undefined }) {
  if (!data) return <span className="text-slate-400 italic text-xs">—</span>;
  return (
    <pre className="text-[11px] font-mono bg-slate-50 border border-slate-100 rounded-lg p-3 overflow-auto max-h-64 text-slate-700 leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function DetailModal({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Chi tiết nhật ký
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {formatDate(log.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Meta info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Người thực hiện
              </p>
              {log.userId ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {log.userId.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={log.userId.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {log.userId.username}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {log.userId.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Hệ thống</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Hành động
              </p>
              <span
                className={cn(
                  "inline-flex mt-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                  getActionStyle(log.action)
                )}
              >
                {log.action}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Đối tượng
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                {log.entityName}
              </p>
              {log.entityId && (
                <p className="text-[10px] font-mono text-slate-400">
                  {String(log.entityId)}
                </p>
              )}
            </div>
          </div>

          {/* Dữ liệu cũ / mới */}
          {(log.oldData || log.newData) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Dữ liệu cũ
                </p>
                <JsonView data={log.oldData} />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Dữ liệu mới
                </p>
                <JsonView data={log.newData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  const fetchData = async (
    p = page,
    filters = {
      action: filterAction,
      entityName: filterEntity,
      startDate: filterStart,
      endDate: filterEnd,
    }
  ) => {
    setLoading(true);
    try {
      const res = await auditLogApi.list({
        page: p,
        limit: 20,
        action: filters.action || undefined,
        entityName: filters.entityName || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]); // eslint-disable-line

  const handleSearch = () => {
    setPage(1);
    fetchData(1);
  };

  const handleReset = () => {
    setFilterAction("");
    setFilterEntity("");
    setFilterStart("");
    setFilterEnd("");
    setPage(1);
    fetchData(1, { action: "", entityName: "", startDate: "", endDate: "" });
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <ScrollText className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            Nhật ký hệ thống
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Tổng {totalItems.toLocaleString("vi-VN")} bản ghi
          </p>
        </div>
        <button
          onClick={() => fetchData(page)}
          className="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm self-start"
        >
          <RefreshCcw
            className={cn("w-3.5 h-3.5", loading && "animate-spin")}
          />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Hành động
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="VD: CREATE, UPDATE..."
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Đối tượng
            </label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            >
              <option value="">Tất cả</option>
              {ENTITY_NAMES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Từ ngày
            </label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Đến ngày
            </label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
          >
            Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Đặt lại
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
            <ScrollText className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có bản ghi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Thời gian
                  </th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Người thực hiện
                  </th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Hành động
                  </th>
                  <th className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Đối tượng
                  </th>
                  <th className="text-right py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((log) => {
                  const isExpanded = expandedRow === log._id;
                  const hasDiff = !!(log.oldData || log.newData);
                  return (
                    <Fragment key={log._id}>
                      <tr
                        className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          {log.userId ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {log.userId.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={log.userId.avatar}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 leading-tight">
                                  {log.userId.username}
                                </p>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                  {log.userId.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Hệ thống
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap",
                              getActionStyle(log.action)
                            )}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-bold text-slate-800">
                            {log.entityName}
                          </p>
                          {log.entityId && (
                            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                              {String(log.entityId)}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasDiff && (
                              <button
                                onClick={() =>
                                  setExpandedRow(isExpanded ? null : log._id)
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title={isExpanded ? "Thu gọn" : "Xem diff"}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => setDetailLog(log)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                            >
                              Xem
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded diff row */}
                      {isExpanded && hasDiff && (
                        <tr
                          className="bg-slate-50/80 border-b border-slate-100"
                        >
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  Dữ liệu cũ
                                </p>
                                <JsonView data={log.oldData} />
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  Dữ liệu mới
                                </p>
                                <JsonView data={log.newData} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  totalPages <= 5
                    ? i + 1
                    : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                        ? totalPages - 4 + i
                        : page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors",
                      pageNum === page
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
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

      {/* Detail Modal */}
      {detailLog && (
        <DetailModal log={detailLog} onClose={() => setDetailLog(null)} />
      )}
    </div>
  );
}
