"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Layers, Loader2, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { categoryApi } from "@/apis/category.api";
import { CategoryAdmin } from "@/types/product";
import { handleApiError } from "@/utils/error.util";
import { useConfirm } from "@/hooks/useConfirm";

interface CategoryForm {
  name: string;
  parentId: string;
}

const DEFAULT_FORM: CategoryForm = { name: "", parentId: "" };

const collator = new Intl.Collator("vi");

function sortGrouped(list: CategoryAdmin[]): CategoryAdmin[] {
  const roots = list
    .filter((c) => !c.parent)
    .sort((a, b) => collator.compare(a.name, b.name));
  const result: CategoryAdmin[] = [];
  for (const root of roots) {
    result.push(root);
    const children = list
      .filter((c) => c.parent?.id === root.id)
      .sort((a, b) => collator.compare(a.name, b.name));
    result.push(...children);
  }
  // children whose parent isn't in the filtered list (e.g. levelFilter === 'child')
  const orphanedChildren = list.filter(
    (c) => c.parent && !roots.find((r) => r.id === c.parent?.id),
  );
  orphanedChildren.sort(
    (a, b) =>
      collator.compare(a.parent?.name ?? "", b.parent?.name ?? "") ||
      collator.compare(a.name, b.name),
  );
  result.push(...orphanedChildren);
  return result;
}

export default function AdminCategoriesPage() {
  const { confirm, confirmDialog } = useConfirm();
  const [categories, setCategories] = useState<CategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryAdmin | null>(null);  
  const [form, setForm] = useState<CategoryForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const rootCategories = categories.filter((c) => c.parent === null);

  const isFiltered = search.trim() !== "" || levelFilter !== "";

  const filteredCategories = useMemo(() => {
    let result = categories;
    if (levelFilter === "root") result = result.filter((c) => c.parent === null);
    if (levelFilter === "child") result = result.filter((c) => c.parent !== null);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.slug.includes(q),
      );
    }
    return sortGrouped(result);
  }, [categories, search, levelFilter]);

  const handleReset = () => {
    setSearch("");
    setLevelFilter("");
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAdminCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEdit = (category: CategoryAdmin) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      parentId: category.parent?.id ?? "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        parentId: form.parentId || null,
      };

      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, payload);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryApi.createCategory(payload);
        toast.success("Thêm danh mục thành công");
      }

      closeModal();
      fetchCategories();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: CategoryAdmin) => {
    const ok = await confirm({
      title: "Xóa danh mục",
      description: `Bạn có chắc muốn xóa danh mục "${category.name}"?`,
      confirmText: "Xóa",
    });
    if (!ok) return;
    try {
      await categoryApi.deleteCategory(category.id);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý danh mục</h1>
          <p className="text-sm text-slate-500">
            Quản lý cây danh mục sản phẩm (tối đa 2 cấp).
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc slug..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all bg-white"
        >
          <option value="">Tất cả cấp</option>
          <option value="root">Danh mục gốc</option>
          <option value="child">Danh mục con</option>
        </select>
        {isFiltered && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Đặt lại
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Layers className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              {isFiltered ? (
                <>
                  <p className="text-slate-900 font-semibold">Không tìm thấy kết quả</p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                </>
              ) : (
                <>
                  <p className="text-slate-900 font-semibold">Chưa có danh mục nào</p>
                  <p className="text-sm text-slate-500">
                    Nhấn &quot;Thêm danh mục&quot; để bắt đầu.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tên danh mục{" "}
                    {isFiltered && (
                      <span className="ml-1 normal-case font-normal text-slate-400">
                        ({filteredCategories.length})
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Danh mục cha
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {category.parent && (
                          <span className="text-slate-300 text-xs">└</span>
                        )}
                        <span className="text-sm font-semibold text-slate-900">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {category.parent ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
                          {category.parent.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500">
                        {category.slug}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">
                        {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Áo Thun, Quần Jean..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Slug sẽ được tạo tự động từ tên.
                </p>
              </div>

              {/* Parent */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Danh mục cha{" "}
                  <span className="text-slate-400 normal-case font-normal">
                    (tùy chọn)
                  </span>
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all bg-white"
                >
                  <option value="">— Danh mục gốc —</option>
                  {rootCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog}
    </div>
  );
}
