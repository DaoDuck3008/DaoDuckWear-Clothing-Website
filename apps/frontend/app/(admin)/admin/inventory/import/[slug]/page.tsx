"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { inventoryApi } from "@/apis/inventory.api";
import { useAuthStore } from "@/stores/auth.store";
import { ShopSelect } from "@/components/ui/ShopSelect";
import { shopApi } from "@/apis/shop.api";
import { Select } from "@/components/ui/Select";
import { toast } from "react-toastify";
import {
  Search,
  Package,
  Loader2,
  ArrowLeft,
  RefreshCcw,
  PackagePlus,
  History,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";

export default function ProductInventoryPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"sku" | "quantity" | "name">("name");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(
    searchParams.get("shopId") || "",
  );

  useEffect(() => {
    if (user?.role === "ADMIN") {
      shopApi.getShops().then((res) => setShops(res));
    }
  }, [user]);

  useEffect(() => {
    const sId = searchParams.get("shopId");
    if (sId) setSelectedShopId(sId);
  }, [searchParams]);

  const fetchProductData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await inventoryApi.getProductInventory(
        slug as string,
        selectedShopId || undefined,
      );
      setProduct(data);
      setQuantities({});
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [slug, selectedShopId]);

  const filteredVariants = useMemo(() => {
    if (!product) return [];

    let variants = [...product.variants];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      variants = variants.filter(
        (v) =>
          v.sku.toLowerCase().includes(lowerSearch) ||
          (v.color || "").toLowerCase().includes(lowerSearch) ||
          (v.size || "").toLowerCase().includes(lowerSearch),
      );
    }

    variants.sort((a, b) => {
      if (sortBy === "sku") return a.sku.localeCompare(b.sku);
      if (sortBy === "quantity") return b.quantity - a.quantity;
      return (a.color || "").localeCompare(b.color || "");
    });

    return variants;
  }, [product, searchTerm, sortBy]);

  const items = useMemo<
    { variantId: string; quantity: number; sku: string }[]
  >(() => {
    if (!product) return [];
    return product.variants
      .map((v: any) => {
        const raw = quantities[v.id];
        const qty = parseInt(raw || "");
        return { variantId: v.id, quantity: isNaN(qty) ? 0 : qty, sku: v.sku };
      })
      .filter(
        (item: { variantId: string; quantity: number; sku: string }) =>
          item.quantity > 0,
      );
  }, [product, quantities]);

  const totalQuantity = items.reduce(
    (s: number, i: { quantity: number }) => s + i.quantity,
    0,
  );

  const handleQuantityChange = (variantId: string, value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setQuantities((prev) => ({ ...prev, [variantId]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!product) return;
    if (items.length === 0) {
      toast.warning("Vui lòng nhập số lượng cho ít nhất 1 biến thể");
      return;
    }
    if (user?.role === "ADMIN" && !selectedShopId) {
      toast.warning("Vui lòng chọn chi nhánh");
      return;
    }

    setSubmitting(true);
    try {
      const result = await inventoryApi.createImport({
        productId: product.id,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        shopId: selectedShopId || undefined,
        note: note.trim() || undefined,
      });
      toast.success(
        `Đã tạo phiếu nhập với ${items.length} biến thể, tổng ${totalQuantity} sản phẩm`,
      );
      setQuantities({});
      setNote("");
      router.push(`/admin/inventory/history/${result.id}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSortBy("name");
    setQuantities({});
    setNote("");
  };

  if (loading && !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Đang lấy dữ liệu sản phẩm...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Sản phẩm không tồn tại.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-black font-bold uppercase text-xs flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  const disabledShop = user?.role === "ADMIN" && !selectedShopId;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-outfit pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
              Nhập kho: {product.name}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {product.categoryId?.name}
              </span>
              <span>
                {user?.role === "ADMIN"
                  ? shops.find((s) => s.id === selectedShopId)?.name ||
                    "Chọn chi nhánh để nhập kho"
                  : user?.shop?.name}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory/history"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-black hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all"
          >
            <History className="w-3.5 h-3.5" />
            Lịch sử nhập
          </Link>
          {user?.role === "ADMIN" && (
            <div className="w-64">
              <ShopSelect
                value={selectedShopId}
                onChange={(id) => setSelectedShopId(id)}
                shops={shops}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="flex-1 relative flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo SKU, màu, kích cỡ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all font-medium"
            />
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-bold uppercase text-[10px] tracking-widest whitespace-nowrap shadow-lg active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            Làm mới
          </button>
        </div>

        <div className="bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[200px]">
          <div className="flex flex-col w-full">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Sắp xếp
            </label>
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { value: "name", label: "Tên sản phẩm" },
                { value: "sku", label: "Mã SKU" },
                { value: "quantity", label: "Số lượng tồn" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Product card */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-start gap-8 bg-slate-50/30">
          <div className="relative group flex-shrink-0">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-white">
              {product.images?.[0] ? (
                <img
                  src={product.images[0].url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <Package className="w-12 h-12 text-slate-200" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                {product.status === "active"
                  ? "Đang kinh doanh"
                  : "Ngừng kinh doanh"}
              </span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {product.variants.length} Biến thể
              </span>
              <span className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                Giá gốc: {formatPrice(product.basePrice)}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
              {product.description || "Không có mô tả cho sản phẩm này."}
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Danh mục
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {product.categoryId?.name}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Mã sản phẩm
                </span>
                <code className="text-sm font-bold text-slate-600">
                  {product.slug}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Variants grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/10">
          {filteredVariants.map((variant) => {
            const inputVal = quantities[variant.id] || "";
            const addQty = parseInt(inputVal) || 0;
            const projected = variant.quantity + addQty;
            return (
              <div
                key={variant.id}
                className={cn(
                  "bg-white p-6 rounded-[24px] border shadow-sm transition-all",
                  addQty > 0
                    ? "border-emerald-300 shadow-emerald-100"
                    : "border-slate-100 hover:shadow-md",
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                      {variant.image ? (
                        <img
                          src={variant.image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-200" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                        {variant.color} / {variant.size}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {formatPrice(variant.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-1">
                      Tồn hiện tại
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {variant.quantity}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <code className="text-[10px] font-black bg-slate-50 px-2.5 py-1.5 rounded-lg text-slate-500 font-mono border border-slate-100">
                      {variant.sku}
                    </code>
                    {variant.reservedQuantity > 0 && (
                      <span className="text-[10px] font-bold text-orange-500">
                        Đang đặt: {variant.reservedQuantity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      + Số lượng
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputVal}
                      onChange={(e) =>
                        handleQuantityChange(variant.id, e.target.value)
                      }
                      className={cn(
                        "flex-1 px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all text-sm font-black placeholder:text-slate-300",
                        addQty > 0
                          ? "border-emerald-300 focus:border-emerald-500"
                          : "border-slate-50 focus:border-black",
                      )}
                    />
                  </div>

                  {addQty > 0 && (
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-right">
                      Sau khi nhập: {projected}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredVariants.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Search className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">
              Không tìm thấy biến thể nào khớp
            </p>
          </div>
        )}
      </div>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Biến thể đã nhập
              </p>
              <p className="text-lg font-black text-slate-900">
                {items.length}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Tổng số lượng
              </p>
              <p className="text-lg font-black text-emerald-600">
                +{totalQuantity}
              </p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-black text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0 || disabledShop}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
              submitting || items.length === 0 || disabledShop
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-slate-900 text-white hover:bg-black",
            )}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PackagePlus className="w-4 h-4" />
            )}
            Tạo phiếu nhập
          </button>
        </div>
      </div>
    </div>
  );
}
