"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderApi } from "@/apis/order.api";
import { paymentApi } from "@/apis/payment.api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ShoppingBag,
  PackageCheck,
  PackageX,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { formatPrice } from "@/utils/format.util";
import { cn } from "@/utils/cn";
import { STATUS_DISPLAY } from "@/constants/order";
import { handleApiError } from "@/utils/error.util";
import { StatusModal } from "@/components/ui/StatusModal";

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  SHIPPING: Truck,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Đặt hàng", Icon: ShoppingBag },
  { key: "CONFIRMED", label: "Xác nhận", Icon: PackageCheck },
  { key: "SHIPPING", label: "Đang giao", Icon: Truck },
  { key: "COMPLETED", label: "Hoàn thành", Icon: CheckCircle2 },
];

const STEP_ORDER = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"];

function getStepIndex(status: string) {
  return STEP_ORDER.indexOf(status);
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handleRepayVnpay = async () => {
    setIsPaying(true);
    try {
      const res = await paymentApi.createVnpayUrl(id as string);
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      handleApiError(err, "Không thể tạo lại liên kết thanh toán");
      setIsPaying(false);
    }
  };

  const handleConfirmReceipt = async () => {
    setIsConfirming(true);
    try {
      await orderApi.confirmReceipt(id as string);
      const res = await orderApi.getOrder(id as string);
      setOrder(res.data);
      toast.success("Xác nhận nhận hàng thành công!");
    } catch (err) {
      handleApiError(err, "Không thể xác nhận nhận hàng");
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrder(id as string);
        setOrder(res.data);
      } catch (error) {
        handleApiError(error, "Không thể tải đơn hàng");
        router.push("/profile/orders");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          Đang tải chi tiết...
        </p>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = STATUS_DISPLAY[order.status] || STATUS_DISPLAY.PENDING;
  const StatusIcon =
    STATUS_ICONS[order.status as keyof typeof STATUS_ICONS] || Clock;

  return (
    <div className="w-full">
      <StatusModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        type="warning"
        title="Xác nhận đã nhận hàng?"
        message="Bạn xác nhận đã nhận được kiện hàng này. Đơn hàng sẽ được đánh dấu hoàn thành và không thể hoàn tác."
        confirmText="Đã nhận hàng"
        cancelText="Chưa nhận"
        onConfirm={handleConfirmReceipt}
      />
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-stone-50 hover:bg-black hover:text-white rounded-2xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">
              Chi tiết đơn hàng
            </h2>
            <p className="text-sm text-stone-400 font-medium mt-1">
              Mã đơn:{" "}
              <span className="text-black font-bold uppercase">
                {order.orderCode}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-stone-100 rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-stone-50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4" /> Sản phẩm ({order.items.length}
                  )
                </h3>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    statusConfig.bg,
                    statusConfig.color,
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>
              <div className="divide-y divide-stone-50">
                {order.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 flex gap-6 group hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-20 h-24 rounded-2xl bg-stone-100 overflow-hidden shadow-sm flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-black uppercase tracking-tight truncate leading-none">
                        {item.name}
                      </h4>
                      {item.shopId?.name && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-stone-100 text-[9px] font-black uppercase tracking-widest text-stone-600">
                          <Store className="w-3 h-3" />
                          {item.shopId.name}
                        </span>
                      )}
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
                        Màu: {item.color} • Size: {item.size}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs font-medium text-stone-500">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                        <p className="text-sm font-black text-black">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-stone-50/30 space-y-3">
                <div className="flex justify-between text-xs font-medium text-stone-500">
                  <span>Tạm tính</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-stone-500">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-medium text-emerald-600">
                    <span>Mã giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ""}</span>
                    <span>−{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-stone-100 flex justify-between">
                  <span className="text-sm font-black uppercase tracking-widest">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-black text-black">
                    {formatPrice(order.finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal Timeline */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-8">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Lịch sử đơn hàng
              </h3>

              {order.status === "CANCELLED" ? (
                /* Cancelled — 2-step row */
                <div className="flex items-start">
                  {/* Step 1: Đặt hàng (done) */}
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shadow-md">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black text-center">
                      Đặt hàng
                    </p>
                    <p className="text-[9px] text-stone-400 font-bold text-center leading-tight">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  {/* Connector */}
                  <div className="flex-1 h-0.5 mt-[22px] bg-rose-200 mx-2" />

                  {/* Step 2: Đã hủy */}
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center shadow-md">
                      <PackageX className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 text-center">
                      Đã hủy
                    </p>
                    <p className="text-[9px] text-stone-400 font-bold text-center leading-tight">
                      Đơn hàng bị hủy
                    </p>
                  </div>
                </div>
              ) : (
                /* Normal flow — 4-step row */
                <div className="flex items-start">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(order.status);
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isFuture = idx > currentIdx;
                    const { Icon } = step;

                    return (
                      <Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[80px]">
                          <div
                            className={cn(
                              "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                              isDone && "bg-black shadow-md",
                              isCurrent &&
                                "bg-black shadow-lg ring-[3px] ring-offset-2 ring-stone-300",
                              isFuture && "bg-stone-100",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5",
                                isDone || isCurrent
                                  ? "text-white"
                                  : "text-stone-300",
                              )}
                            />
                          </div>
                          <p
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest text-center",
                              isFuture ? "text-stone-300" : "text-black",
                            )}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-stone-400 text-center leading-tight">
                              Hiện tại
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider">
                              Hoàn tất
                            </span>
                          )}
                        </div>

                        {/* Connector (not after last step) */}
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "flex-1 h-0.5 mt-[22px] mx-1 rounded-full transition-colors",
                              idx < currentIdx ? "bg-black" : "bg-stone-100",
                            )}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              )}

              <p className="mt-6 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                Đặt lúc:{" "}
                <span className="text-stone-600">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </span>
              </p>

              {/* Confirm Receipt CTA — chỉ hiện khi SHIPPING */}
              {order.status === "SHIPPING" && (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isConfirming}
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PackageCheck className="w-3.5 h-3.5" />
                    )}
                    Đã nhận được hàng
                  </button>
                  <p className="mt-2 text-[10px] text-stone-400">
                    Xác nhận khi bạn đã nhận được kiện hàng
                  </p>
                </div>
              )}

              {/* Review CTA — chỉ hiện khi COMPLETED */}
              {order.status === "COMPLETED" && (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <Link
                    href={`/profile/orders/${id}/review`}
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Đánh giá sản phẩm
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-8 space-y-4 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Địa chỉ nhận hàng
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-black text-black uppercase tracking-tight">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  {order.shippingAddress.phone}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.ward}, {order.shippingAddress.district}
                  , {order.shippingAddress.province}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-8 space-y-4 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Phương thức thanh toán
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-black text-black uppercase tracking-tight">
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order.paymentMethod}
                </p>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600",
                  )}
                >
                  {order.paymentStatus === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </span>
              </div>

              {/* Thanh toán lại — chỉ với đơn VNPAY chưa thanh toán & còn chờ xử lý */}
              {order.paymentMethod === "VNPAY" &&
                order.paymentStatus !== "PAID" &&
                order.status === "PENDING" && (
                  <button
                    onClick={handleRepayVnpay}
                    disabled={isPaying}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all disabled:opacity-50"
                  >
                    {isPaying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                    Thanh toán lại
                  </button>
                )}
            </div>

            {/* Support */}
            <div className="bg-stone-50 rounded-[32px] p-8 space-y-4">
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" /> Giao hàng bởi
              </p>
              <p className="text-sm font-black text-black uppercase tracking-tight">
                DaoDuck Express
              </p>
              <p className="text-[10px] text-stone-400 font-medium leading-relaxed italic">
                * Thời gian giao hàng dự kiến từ 2-4 ngày làm việc tùy khu vực.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
