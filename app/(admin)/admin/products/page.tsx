"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Package,
  RefreshCcw,
  X,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { productApi } from "@/apis/product.api";
import { categoryApi } from "@/apis/category.api";
import { Select } from "@/components/ui/Select";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";
import { cn } from "@/utils/cn";
import { useConfirm } from "@/hooks/useConfirm";
import { StatusModal } from "@/components/ui/StatusModal";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminProductsPage() {
  const { confirm, confirmDialog } = useConfirm();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");
  const [statusModal, setStatusModal] = useState<{ open: boolean; product: any | null }>({ open: false, product: null });

  const user = useAuthStore((s) => s.user);

  const hasActiveFilter =
    searchTerm || statusFilter || categoryFilter || sortFilter;

  // Flatten category tree cho Select options
  const categoryOptions = [
    { value: "", label: "Tất cả danh mục" },
    ...categories.flatMap((cat: any) => [
      { value: cat.id, label: cat.name },
      ...(cat.children || []).map((c: any) => ({
        value: c.id,
        label: `  └ ${c.name}`,
      })),
    ]),
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.getAdminProducts({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        sort: sortFilter || undefined,
      });
      setProducts(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryApi.getCategories().then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter, sortFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
    setSortFilter("");
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa sản phẩm",
      description: "Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác không thể hoàn tác.",
      confirmText: "Xóa",
    });
    if (!ok) return;
    try {
      await productApi.deleteProduct(id);
      toast.success("Đã xóa sản phẩm");
      fetchProducts();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusModal.product) return;
    const newStatus = statusModal.product.status === "active" ? "inactive" : "active";
    try {
      await productApi.updateProductStatus(statusModal.product.id, newStatus);
      toast.success(newStatus === "active" ? "Đã kích hoạt sản phẩm" : "Đã ngừng bán sản phẩm");
      setStatusModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      handleApiError(error, "Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 md:w-6 md:h-6" />
            Quản lý Sản phẩm
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Xem, thêm mới và quản lý tất cả sản phẩm trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black rounded-xl transition-all shadow-sm"
            title="Làm mới"
          >
            <RefreshCcw
              className={cn("w-4 h-4", loading && "animate-spin")}
            />
          </button>
          <Link
            href="/admin/products/create-product"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="sm:col-span-2 relative group"
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Tên sản phẩm, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm transition-all font-medium"
              />
            </div>
          </form>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Trạng thái
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang bán" },
                { value: "inactive", label: "Ngừng bán" },
              ]}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Danh mục
            </label>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
              placeholder="Tất cả danh mục"
            />
          </div>

          {/* Sort */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Sắp xếp
            </label>
            <Select
              value={sortFilter}
              onChange={setSortFilter}
              options={[
                { value: "", label: "Mặc định (Mới nhất)" },
                { value: "name_asc", label: "Tên A → Z" },
                { value: "name_desc", label: "Tên Z → A" },
                { value: "price_asc", label: "Giá thấp → cao" },
                { value: "price_desc", label: "Giá cao → thấp" },
                { value: "oldest", label: "Cũ nhất" },
              ]}
              placeholder="Mặc định"
            />
          </div>
        </div>

        {/* Active filter strip + reset */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Bộ lọc đang dùng:
              </span>
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <Tag className="w-2.5 h-2.5" />
                  {statusFilter === "active" ? "Đang bán" : "Ngừng bán"}
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <Tag className="w-2.5 h-2.5" />
                  {categoryOptions.find((c) => c.value === categoryFilter)?.label?.trim()}
                </span>
              )}
              {sortFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <Tag className="w-2.5 h-2.5" />
                  {[
                    { value: "name_asc", label: "Tên A→Z" },
                    { value: "name_desc", label: "Tên Z→A" },
                    { value: "price_asc", label: "Giá thấp→cao" },
                    { value: "price_desc", label: "Giá cao→thấp" },
                    { value: "oldest", label: "Cũ nhất" },
                  ].find((s) => s.value === sortFilter)?.label}
                </span>
              )}
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
            >
              <X className="w-3 h-3" />
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Tìm thấy{" "}
            <span className="text-slate-900">{products.length}</span> sản phẩm
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Không tìm thấy sản phẩm</p>
              <p className="text-sm text-slate-400 mt-0.5">
                Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-black text-slate-500 hover:text-black uppercase tracking-widest underline underline-offset-4 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Sản phẩm
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">
                    Danh mục
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Giá cơ bản
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap hidden sm:table-cell">
                    Biến thể
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap hidden lg:table-cell">
                    Ngày tạo
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Product info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
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
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight max-w-[180px] md:max-w-xs">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {product.categoryId?.name || "N/A"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-slate-900">
                        {formatPrice(product.basePrice)}
                      </span>
                    </td>

                    {/* Variant count */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black">
                        {product.variantCount ?? "—"}
                        <span className="text-slate-400 font-normal">biến thể</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            product.status === "active"
                              ? "bg-emerald-500"
                              : "bg-slate-400",
                          )}
                        />
                        {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Xem trên web"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {user!.role === "ADMIN" && (
                          <>
                          <button
                          onClick={() => setStatusModal({ open: true, product })}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            product.status === "active"
                              ? "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
                              : "text-slate-300 hover:text-slate-600 hover:bg-slate-100",
                          )}
                          title={product.status === "active" ? "Ngừng bán" : "Kích hoạt"}
                        >
                          {product.status === "active" ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/products/edit/${product.slug}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                          </>
                        )}
                       
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, product: null })}
        onConfirm={handleConfirmToggleStatus}
        type={statusModal.product?.status === "active" ? "warning" : "success"}
        title={
          statusModal.product?.status === "active"
            ? "Ngừng bán sản phẩm?"
            : "Kích hoạt sản phẩm?"
        }
        description={
          statusModal.product?.status === "active"
            ? `Sản phẩm "${statusModal.product?.name}" sẽ bị ẩn khỏi cửa hàng và khách hàng không thể đặt hàng.`
            : `Sản phẩm "${statusModal.product?.name}" sẽ được hiển thị trở lại trên cửa hàng.`
        }
        confirmText={statusModal.product?.status === "active" ? "Ngừng bán" : "Kích hoạt"}
        cancelText="Để tôi xem lại"
      />

      {confirmDialog}
    </div>
  );
}
