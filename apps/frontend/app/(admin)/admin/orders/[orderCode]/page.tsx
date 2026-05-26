"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderApi } from "@/apis/order.api";
import {
  ChevronLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Clock,
  Store,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";
import { toast } from "react-toastify";
import { StatusModal } from "@/components/ui/StatusModal";
import {
  NEXT_STATUS,
  NEXT_STATUS_LABEL,
  STATUS_COLORS,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/constants/order";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = params.orderCode as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "warning";
    title: string;
    description: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "warning",
    title: "",
    description: "",
  });

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAdminOrderByCode(orderCode);
      setOrder(res.data);
    } catch (error) {
      handleApiError(error);
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderCode) fetchOrder();
  }, [orderCode]);

  const handleUpdateStatusClick = (newStatus: string) => {
    setModalConfig({
      isOpen: true,
      type: "warning",
      title: "Xác nhận cập nhật",
      description: `Bạn có chắc muốn chuyển trạng thái đơn hàng sang ${STATUS_LABELS[newStatus]}?`,
      onConfirm: () => performUpdateStatus(newStatus),
    });
  };

  const performUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await orderApi.updateOrderStatus(order.id, newStatus);
      toast.success("Cập nhật thành công");
      fetchOrder();
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-outfit pb-32">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">#{order.orderCode}</h1>
                <span className={cn(
                  "px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  STATUS_COLORS[order.status]
                )}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                <Clock className="w-3 h-3 ml-2" />
                {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              In hóa đơn
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items List */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <Package className="w-5 h-5 text-slate-400" />
                Danh sách sản phẩm ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-8 flex gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="w-24 h-32 rounded-[20px] bg-slate-100 overflow-hidden shadow-sm flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 leading-snug">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                          ID: {item.productId.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <p className="font-black text-slate-900">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Size: {item.size}
                      </div>
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Màu: {item.color}
                      </div>
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                        SL: x{item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <Store className="w-3.5 h-3.5" />
                      Chi nhánh: <span className="text-slate-900">{item.shopId?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Summary */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Tổng kết thanh toán</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Tạm tính</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Mã giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ""}</span>
                  <span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-base font-black text-slate-900 uppercase">Tổng cộng</span>
                <span className="text-2xl font-black text-slate-900">{formatPrice(order.finalTotal)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-8">
          {/* Customer Info */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 text-sm font-black text-slate-900 uppercase tracking-widest">
              <User className="w-5 h-5 text-slate-400" />
              Khách hàng
            </div>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Họ và tên</span>
                <span className="text-sm font-bold text-slate-900">{order.shippingAddress.fullName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email</span>
                <span className="text-sm font-bold text-slate-900">{order.shippingAddress.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Số điện thoại</span>
                <span className="text-sm font-bold text-slate-900 tracking-wider">{order.shippingAddress.phone}</span>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 text-sm font-black text-slate-900 uppercase tracking-widest">
              <MapPin className="w-5 h-5 text-slate-400" />
              Địa chỉ nhận hàng
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.province}
                </p>
              </div>
              {order.shippingAddress.note && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ghi chú</span>
                  <p className="text-xs font-medium text-slate-500 italic mt-1 leading-relaxed">
                    "{order.shippingAddress.note}"
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 text-sm font-black text-slate-900 uppercase tracking-widest">
              <CreditCard className="w-5 h-5 text-slate-400" />
              Thanh toán
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-black text-slate-900 uppercase">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                <p className={cn(
                  "text-[10px] font-black uppercase mt-1",
                  PAYMENT_STATUS_LABELS[order.paymentStatus] === "Đã thanh toán" ? "text-emerald-500" : "text-rose-500"
                )}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                PAYMENT_STATUS_LABELS[order.paymentStatus] === "Đã thanh toán" ? "bg-emerald-50" : "bg-rose-50"
              )}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus] === "Đã thanh toán" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Actions Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-4 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-3 ml-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái hiện tại</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{STATUS_LABELS[order.status]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:flex-none">
            {/* Cancel Action */}
            {["PENDING", "CONFIRMED"].includes(order.status) && (
              <button 
                onClick={() => handleUpdateStatusClick("CANCELLED")}
                disabled={updating}
                className="flex-1 sm:flex-none px-6 h-14 bg-rose-50 text-rose-600 rounded-[20px] hover:bg-rose-100 transition-all font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Từ chối đơn
              </button>
            )}

            {/* Next Status Action */}
            {NEXT_STATUS[order.status] && (
              <button
                onClick={() => handleUpdateStatusClick(NEXT_STATUS[order.status]!)}
                disabled={updating}
                className="flex-1 sm:flex-none px-10 h-14 bg-slate-900 text-white rounded-[20px] hover:bg-black transition-all font-black uppercase text-[11px] tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {NEXT_STATUS_LABEL[NEXT_STATUS[order.status]!]}
              </button>
            )}
            
            {/* If Completed, show success */}
            {order.status === "COMPLETED" && (
              <div className="px-10 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Đơn hàng đã hoàn thành
              </div>
            )}
            
            {order.status === "CANCELLED" && (
              <div className="px-10 h-14 bg-slate-100 text-slate-400 rounded-[20px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" />
                Đơn hàng đã hủy
              </div>
            )}
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
