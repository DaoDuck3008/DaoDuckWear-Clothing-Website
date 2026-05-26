"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  Truck,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Tag,
  X,
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useBuyNowStore } from "@/stores/buy-now.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/utils/cn";
import { orderApi } from "@/apis/order.api";
import { voucherApi } from "@/apis/voucher.api";
import { getProfile } from "@/apis/auth.api";
import { toast } from "react-toastify";
import AddressSelect from "@/components/common/AddressSelect";
import CheckoutProductCard from "@/components/checkout/CheckoutProductCard";
import { LoadingLayer } from "@/components/ui/LoadingLayer";
import { handleApiError } from "@/utils/error.util";
import { StatusModal } from "@/components/ui/StatusModal";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("type") === "buynow";

  const { items: cartItems, totalPrice: cartTotalPrice, clearCart } = useCartStore();
  const buyNowItem = useBuyNowStore((s) => s.item);
  const clearBuyNowItem = useBuyNowStore((s) => s.clearItem);

  const displayItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;
  const displayTotalPrice = isBuyNow 
    ? (buyNowItem ? buyNowItem.price * buyNowItem.quantity : 0) 
    : cartTotalPrice();

  const hydrated = useAuthStore((s) => s.hydrated);

  const [mounted, setMounted] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voucher
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    provinceCode: 0,
    ward: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const initCheckout = async () => {
      try {
        const response = await getProfile();
        setFormData((prev) => ({
          ...prev,
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
        }));
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsPageLoading(false);
      }
    };

    initCheckout();
  }, [hydrated]);

  if (!mounted) return null;

  // Render Empty State if no items
  if (hydrated && !isPageLoading && !isSuccess && displayItems.length === 0) {
    return (
      <StatusModal
        isOpen={displayItems.length === 0}
        onClose={() => router.push("/")}
        type="warning"
        title="Giỏ hàng đang trống"
        message="Có vẻ như bạn đã xóa hết sản phẩm. Chúng tôi sẽ đưa bạn quay lại trang chủ trong giây lát..."
        buttonText="Quay lại trang chủ"
      />
    );
  }

  const shippingFee = 30000;
  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const finalTotal = displayTotalPrice + shippingFee - discountAmount;

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const res = await voucherApi.validate({ code: voucherInput.trim(), orderTotal: displayTotalPrice });
      setAppliedVoucher({ code: voucherInput.trim().toUpperCase(), discountAmount: res.data.discountAmount });
      setVoucherInput("");
    } catch (err: any) {
      setVoucherError(err?.response?.data?.message || "Mã giảm giá không hợp lệ");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    field: "province" | "ward",
    name: string,
    code: number,
  ) => {
    if (field === "province") {
      setFormData((prev) => ({
        ...prev,
        province: name,
        provinceCode: code,
        ward: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, ward: name }));
    }
  };

  const handleSubmitOrder = async () => {
    if (!isBuyNow && !useCartStore.getState().cartId) {
      setError(
        "Không tìm thấy giỏ hàng. Vui lòng quay lại giỏ hàng và thử lại.",
      );
      return;
    }

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.province ||
      !formData.ward ||
      !formData.address
    ) {
      setError("Vui lòng điền đầy đủ thông tin nhận hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: any = {
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          province: formData.province,
          ward: formData.ward,
          address: formData.address,
          note: formData.note,
        },
        paymentMethod: formData.paymentMethod,
      };

      if (isBuyNow && buyNowItem) {
        orderPayload.buyNowItem = {
          productId: buyNowItem.productId,
          variantId: buyNowItem.variantId,
          shopId: buyNowItem.shopId,
          quantity: buyNowItem.quantity,
        };
      } else {
        orderPayload.cartId = useCartStore.getState().cartId;
      }

      if (appliedVoucher) {
        orderPayload.voucherCode = appliedVoucher.code;
      }

      await orderApi.createOrder(orderPayload);
      setIsSuccess(true);
      
      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <LoadingLayer isLoading={isSubmitting} message="Đang xử lý đơn hàng..." />
    );
  }

  return (
    <div className="min-h-screen bg-white font-outfit">
      <LoadingLayer
        isLoading={isPageLoading}
        message="Đang chuẩn bị đơn hàng..."
      />

      {/* Success Modal */}
      <StatusModal
        isOpen={isSuccess}
        onClose={() => router.push("/")}
        type="success"
        title="Đặt hàng thành công!"
        message="Cảm ơn bạn đã tin tưởng DaoDuck Wear. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn."
        buttonText="Về trang chủ"
      />

      {/* Warning/Error Modal */}
      <StatusModal
        isOpen={!!error}
        onClose={() => setError(null)}
        type="warning"
        title="Đã có lỗi xảy ra"
        message={error || ""}
        buttonText="Thử lại"
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-stone-100">
        <div className="lg:col-span-7 px-6 lg:px-16 py-12 lg:py-20">
          <div className="max-w-[600px] ml-auto w-full">
            <Link href="/" className="inline-block mb-12">
              <span className="font-cormorant text-3xl font-bold tracking-tighter uppercase italic">
                DaoDuck Wear
              </span>
            </Link>

            <div className="space-y-12">
              <section>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                    01
                  </span>
                  Vận chuyển
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                      Họ và tên
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Họ và tên người nhận"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 focus:border-black outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                      Email
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 focus:border-black outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                      Số điện thoại
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 focus:border-black outline-none text-sm transition-all"
                    />
                  </div>

                  <AddressSelect
                    label="Tỉnh / Thành phố"
                    type="province"
                    value={formData.province}
                    onSelect={(name, code) =>
                      handleSelectChange("province", name, code)
                    }
                  />
                  <AddressSelect
                    label="Phường / Xã"
                    type="ward"
                    parentCode={formData.provinceCode}
                    disabled={!formData.provinceCode}
                    value={formData.ward}
                    onSelect={(name, code) =>
                      handleSelectChange("ward", name, code)
                    }
                  />

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Số nhà, tên đường..."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 focus:border-black outline-none text-sm transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Lời nhắn cho shipper..."
                      rows={3}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 focus:border-black outline-none text-sm resize-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                    02
                  </span>
                  Thanh toán
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, paymentMethod: "COD" }))
                    }
                    className={cn(
                      "p-6 border text-left transition-all relative group",
                      formData.paymentMethod === "COD"
                        ? "border-black bg-white"
                        : "border-stone-100 bg-stone-50 opacity-60",
                    )}
                  >
                    <ShoppingBag className="w-5 h-5 mb-4" />
                    <div className="text-xs font-bold uppercase tracking-widest">
                      Tiền mặt (COD)
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1">
                      Thanh toán khi nhận hàng
                    </div>
                    {formData.paymentMethod === "COD" && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-black rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: "BANK_TRANSFER",
                      }))
                    }
                    className={cn(
                      "p-6 border text-left transition-all relative group",
                      formData.paymentMethod === "BANK_TRANSFER"
                        ? "border-black bg-white"
                        : "border-stone-100 bg-stone-50 opacity-60",
                    )}
                  >
                    <CreditCard className="w-5 h-5 mb-4" />
                    <div className="text-xs font-bold uppercase tracking-widest">
                      Chuyển khoản
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1">
                      Qua ngân hàng / Ví điện tử
                    </div>
                    {formData.paymentMethod === "BANK_TRANSFER" && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-black rounded-full" />
                    )}
                  </button>
                </div>
              </section>

              {/* Voucher section */}
              <section>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                    03
                  </span>
                  Mã giảm giá
                </h2>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-stone-600" />
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-700">
                        {appliedVoucher.code}
                      </span>
                      <span className="text-xs text-stone-500">
                        — Giảm {appliedVoucher.discountAmount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="p-1 hover:text-red-600 transition-colors text-stone-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                        placeholder="Nhập mã giảm giá..."
                        className="flex-1 px-4 py-3 bg-stone-50 border border-stone-100 focus:border-black outline-none text-sm transition-all uppercase tracking-widest font-medium"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherInput.trim()}
                        className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-stone-800 transition-colors flex items-center gap-2"
                      >
                        {voucherLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-[11px] text-red-600 font-medium">{voucherError}</p>
                    )}
                  </div>
                )}
              </section>

              <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                <Link
                  href="/cart"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" /> Quay lại giỏ hàng
                </Link>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="bg-black text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.4em] disabled:opacity-50 flex items-center gap-3 hover:bg-stone-800 transition-all shadow-xl"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 px-6 lg:px-16 py-12 lg:py-20 bg-stone-50/50">
          <div className="max-w-[450px] w-full">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-10 italic">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-8 mb-10 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
              {displayItems.map((item) => (
                <CheckoutProductCard
                  key={`${item.productId}-${item.variantId}`}
                  item={item as any}
                  shopName={item.shopName || "Cửa hàng"}
                  isBuyNow={isBuyNow}
                />
              ))}
            </div>

            <div className="space-y-4 py-8 border-y border-stone-200">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                <span>Tạm tính</span>
                <span className="text-black">
                  {displayTotalPrice.toLocaleString("vi-VN")}₫
                </span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    Mã {appliedVoucher.code}
                  </span>
                  <span>−{appliedVoucher.discountAmount.toLocaleString("vi-VN")}₫</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                <span>Phí vận chuyển</span>
                <span className="text-black">30.000₫</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-8">
              <span className="text-lg font-bold uppercase tracking-[0.2em] italic">
                Tổng thanh toán
              </span>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 font-bold block mb-1">
                  VNĐ
                </span>
                <span className="text-3xl font-bold tracking-tighter">
                  {finalTotal.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
