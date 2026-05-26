"use client";

import { useEffect, useState } from "react";
import { inventoryApi } from "@/apis/inventory.api";
import { categoryApi } from "@/apis/category.api";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { Select } from "@/components/ui/Select";
import { toast } from "react-toastify";
import {
  Search,
  Package,
  Warehouse,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCcw,
  ArrowRight,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { ShopSelect } from "@/components/ui/ShopSelect";
import { shopApi } from "@/apis/shop.api";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const user = useAuthStore((state) => state.user);

  // Tính toán thống kê low stock từ dữ liệu hiện tại
  const lowStockProducts = data.filter((p) =>
    p.variants?.some((v: any) => v.quantity <= LOW_STOCK_THRESHOLD),
  );
  const totalLowStockVariants = data.reduce(
    (acc, p) =>
      acc +
      (p.variants?.filter((v: any) => v.quantity <= LOW_STOCK_THRESHOLD)
        .length || 0),
    0,
  );

  useEffect(() => {
    if (user?.role === "ADMIN") {
      shopApi.getShops().then((res) => setShops(res));
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, categoriesRes] = await Promise.all([
        inventoryApi.getInventory({
          search: searchTerm,
          categoryId: selectedCategory,
          sort: sortBy,
          shopId: selectedShopId || undefined,
          page,
          limit,
        }),
        categories.length === 0
          ? categoryApi.getCategories()
          : Promise.resolve(null),
      ]);

      setData(inventoryRes.data);
      setTotalPages(inventoryRes.totalPages || 1);
      setTotalItems(inventoryRes.total || 0);

      if (categoriesRes) setCategories(categoriesRes);

      if (searchTerm) {
        setExpandedProducts(inventoryRes.data.map((p: any) => p.id));
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, selectedShopId, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortBy, searchTerm, selectedShopId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("createdAt_desc");
    setSelectedShopId("");
    setPage(1);
  };

  const toggleProduct = (productId: string) => {
    setExpandedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Warehouse className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            Bảng tồn kho
            {selectedShopId || user?.role !== "ADMIN" ? (
              <span className="text-slate-500 text-base">
                —{" "}
                {user?.role === "ADMIN"
                  ? shops.find((s) => s.id === selectedShopId)?.name
                  : user?.shop?.name}
              </span>
            ) : (
              <span className="text-slate-500 text-base">— Toàn hệ thống</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Theo dõi và quản lý số lượng tồn kho của tất cả sản phẩm.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
          >
            <RefreshCcw
              className={cn("w-3.5 h-3.5", loading && "animate-spin")}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <Link
            href="/admin/inventory/history"
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95"
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lịch sử nhập kho</span>
            <span className="sm:hidden">Lịch sử</span>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tổng sản phẩm
            </p>
            <p className="text-xl font-black text-slate-900">{totalItems}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Hiển thị trang này
            </p>
            <p className="text-xl font-black text-slate-900">{data.length}</p>
          </div>
          <div
            className={cn(
              "rounded-xl border px-4 py-3 shadow-sm",
              lowStockProducts.length > 0
                ? "bg-red-50 border-red-100"
                : "bg-white border-slate-100",
            )}
          >
            <p
              className={cn(
                "text-[9px] font-black uppercase tracking-widest mb-1",
                lowStockProducts.length > 0
                  ? "text-red-400"
                  : "text-slate-400",
              )}
            >
              Sản phẩm sắp hết
            </p>
            <p
              className={cn(
                "text-xl font-black",
                lowStockProducts.length > 0
                  ? "text-red-600"
                  : "text-slate-300",
              )}
            >
              {lowStockProducts.length}
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border px-4 py-3 shadow-sm",
              totalLowStockVariants > 0
                ? "bg-amber-50 border-amber-100"
                : "bg-white border-slate-100",
            )}
          >
            <p
              className={cn(
                "text-[9px] font-black uppercase tracking-widest mb-1",
                totalLowStockVariants > 0
                  ? "text-amber-500"
                  : "text-slate-400",
              )}
            >
              Biến thể cần nhập
            </p>
            <p
              className={cn(
                "text-xl font-black",
                totalLowStockVariants > 0
                  ? "text-amber-600"
                  : "text-slate-300",
              )}
            >
              {totalLowStockVariants}
            </p>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-5 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Tìm kiếm sản phẩm
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="Tên, slug hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm transition-all font-medium"
              />
            </div>
          </form>

          {/* Category */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Danh mục
            </label>
            <CategorySelect
              value={selectedCategory}
              onChange={(id) => setSelectedCategory(id)}
              categories={categories}
            />
          </div>

          {/* Sort */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Sắp xếp
            </label>
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "createdAt_desc", label: "Mới nhất" },
                { value: "createdAt_asc", label: "Cũ nhất" },
                { value: "name_asc", label: "Tên A-Z" },
                { value: "name_desc", label: "Tên Z-A" },
              ]}
            />
          </div>

          {/* Shop (ADMIN) */}
          {user?.role === "ADMIN" && (
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Chi nhánh
              </label>
              <ShopSelect
                value={selectedShopId}
                onChange={setSelectedShopId}
                shops={shops}
              />
            </div>
          )}

          {/* Reset */}
          <div className="md:col-span-1 flex items-end justify-center">
            <button
              onClick={handleReset}
              className="w-full p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="Xóa bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Đang tải dữ liệu kho...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-200" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">Trống rỗng</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-black text-slate-400 hover:text-black uppercase tracking-widest underline underline-offset-4 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((product) => {
              const productLowStockCount = product.variants?.filter(
                (v: any) => v.quantity <= LOW_STOCK_THRESHOLD,
              ).length || 0;
              const isExpanded = expandedProducts.includes(product.id);

              return (
                <div key={product.id} className="flex flex-col">
                  {/* Product row */}
                  <div
                    onClick={() => toggleProduct(product.id)}
                    className="px-4 md:px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                          {product.name}
                        </h3>
                        {productLowStockCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider flex-shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {productLowStockCount} sắp hết
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          {product.categoryId?.name || "Sản phẩm"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {product.variants?.length || 0} biến thể
                        </span>
                      </div>
                    </div>

                    {/* Total stock */}
                    <div className="hidden lg:block text-right flex-shrink-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        {selectedShopId || user?.role !== "ADMIN"
                          ? "Tại chi nhánh"
                          : "Tổng tồn kho"}
                      </p>
                      <p
                        className={cn(
                          "text-lg font-black",
                          productLowStockCount > 0
                            ? "text-red-600"
                            : "text-slate-900",
                        )}
                      >
                        {product.variants?.reduce(
                          (acc: number, v: any) => acc + (v.quantity || 0),
                          0,
                        )}
                      </p>
                    </div>

                    {/* Import link */}
                    <Link
                      href={`/admin/inventory/import/${product.slug}${selectedShopId ? `?shopId=${selectedShopId}` : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user?.role === "ADMIN" && !selectedShopId)
                          e.preventDefault();
                      }}
                      className={cn(
                        "px-3 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0",
                        user?.role === "ADMIN" && !selectedShopId
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-black shadow-md",
                      )}
                    >
                      <span className="hidden sm:inline">Quản lý</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Expand chevron */}
                    <div className="flex-shrink-0 text-slate-400 group-hover:text-black transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Variants table (collapsible) */}
                  {isExpanded && (
                    <div className="bg-slate-50/30 border-t border-slate-100 px-4 md:px-6 py-3 overflow-x-auto">
                      <table className="w-full min-w-[560px]">
                        <thead>
                          <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                            <th className="py-3 text-left">Phân loại</th>
                            <th className="py-3 text-center">Mã SKU</th>
                            <th className="py-3 text-center">Đang đặt</th>
                            <th className="py-3 text-right">
                              {selectedShopId || user?.role !== "ADMIN"
                                ? "Tồn kho"
                                : "Tổng tồn kho"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {product.variants?.map((variant: any) => {
                            const isLow =
                              variant.quantity <= LOW_STOCK_THRESHOLD;
                            return (
                              <tr
                                key={variant.id}
                                className={cn(
                                  "group/row",
                                  isLow && "bg-red-50/40",
                                )}
                              >
                                <td className="py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                      {variant.image ? (
                                        <img
                                          src={variant.image}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                          <Package className="w-4 h-4 text-slate-200" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                        {variant.color} / {variant.size}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                        {formatPrice(variant.price)}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-center">
                                  <code className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-slate-100 text-slate-600 font-mono">
                                    {variant.sku}
                                  </code>
                                </td>
                                <td className="py-3 text-center">
                                  <span
                                    className={cn(
                                      "text-xs font-black",
                                      variant.reservedQuantity > 0
                                        ? "text-orange-500"
                                        : "text-slate-200",
                                    )}
                                  >
                                    {variant.reservedQuantity}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isLow && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-black uppercase">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Sắp hết
                                      </span>
                                    )}
                                    <span
                                      className={cn(
                                        "text-sm font-black",
                                        isLow
                                          ? "text-red-600"
                                          : "text-slate-900",
                                      )}
                                    >
                                      {variant.quantity}
                                      <span className="text-[10px] text-slate-400 font-bold ml-1">
                                        sp
                                      </span>
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="px-5 md:px-8 py-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Hiển thị{" "}
              <span className="text-slate-900">{data.length}</span> trên{" "}
              <span className="text-slate-900">{totalItems}</span> sản phẩm
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    if (
                      totalPages > 7 &&
                      p !== 1 &&
                      p !== totalPages &&
                      Math.abs(p - page) > 2
                    ) {
                      if (Math.abs(p - page) === 3)
                        return (
                          <span key={p} className="px-1 text-slate-300 text-xs">
                            …
                          </span>
                        );
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-9 h-9 rounded-xl text-xs font-black transition-all",
                          page === p
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-white border border-slate-100 text-slate-500 hover:border-black hover:text-black",
                        )}
                      >
                        {p}
                      </button>
                    );
                  },
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Mỗi trang
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-100 hover:border-black rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition-all"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-100">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
          Hệ thống quản lý tồn kho DaoDuck Wear v1.2
        </p>
      </div>
    </div>
  );
}
