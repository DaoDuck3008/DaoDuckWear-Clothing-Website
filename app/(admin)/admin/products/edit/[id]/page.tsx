"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Package,
  Type,
  Tag,
  Image as ImageIcon,
  Save,
  ChevronRight,
  Lock,
} from "lucide-react";
import { CategorySelect } from "@/components/ui/CategorySelect";
import {
  MainImageDropzone,
  EditableImageDropzone,
} from "@/components/ui/ImageDropzone";
import { ColorDropdown } from "@/components/ui/ColorDropdown";
import { STATUS_OPTIONS, SIZES } from "@/constants/product";
import { LoadingLayer } from "@/components/ui/LoadingLayer";
import { useProductEdit } from "@/hooks/product/useProductEdit";
import { StatusModal } from "@/components/ui/StatusModal";
import { useState } from "react";
import RoleGuard from "@/components/guards/roleGuard";
import { cn } from "@/utils/cn";

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  const {
    name,
    setName,
    slug,
    description,
    setDescription,
    basePrice,
    setBasePrice,
    categoryId,
    setCategoryId,
    status,
    setStatus,
    variants,
    updateVariant,
    generateAutoSKUs,
    existingMainImages,
    existingColorImages,
    removeExistingMainImage,
    setMainExistingImage,
    removeExistingColorImage,
    newMainImages,
    newColorImages,
    addNewMainImages,
    removeNewMainImage,
    addNewColorImages,
    removeNewColorImage,
    loading,
    isSubmitting,
    loadingMessage,
    categories,
    colors,
    addVariant,
    addColorGroup,
    addSizeToColor,
    updateColorGroup,
    removeVariant,
    removeColorGroup,
    handleSubmit,
  } = useProductEdit(id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);
  const [colorGroupModalOpen, setColorGroupModalOpen] = useState(false);
  const [colorGroupToDelete, setColorGroupToDelete] = useState<string | null>(null);

  const confirmDeleteVariant = (vId: string) => {
    if (vId.startsWith("new-")) {
      removeVariant(vId);
      return;
    }
    setVariantToDelete(vId);
    setDeleteModalOpen(true);
  };

  const handleDeleteVariant = () => {
    if (variantToDelete) {
      removeVariant(variantToDelete);
      setDeleteModalOpen(false);
      setVariantToDelete(null);
    }
  };

  const confirmDeleteColorGroup = (color: string) => {
    setColorGroupToDelete(color);
    setColorGroupModalOpen(true);
  };

  const handleDeleteColorGroup = () => {
    if (colorGroupToDelete) {
      removeColorGroup(colorGroupToDelete);
      setColorGroupModalOpen(false);
      setColorGroupToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-full bg-slate-50/50 pb-24">
        <LoadingLayer isLoading={isSubmitting} message={loadingMessage} />

        {/* Page Header */}
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/admin/products"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium min-w-0">
                <Link
                  href="/admin/products"
                  className="hover:text-slate-900 transition-colors flex-shrink-0"
                >
                  Sản phẩm
                </Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className="text-slate-900 font-bold truncate">{name || "Chỉnh sửa"}</span>
              </div>
              <div className="sm:hidden font-black text-slate-900 uppercase tracking-tight text-sm truncate">
                Chỉnh sửa sản phẩm
              </div>
            </div>

            {/* Slug — desktop */}
            <div className="hidden lg:block text-center flex-shrink-0">
              <p className="font-black text-slate-900 uppercase tracking-tight truncate max-w-xs">
                {name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{slug}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/admin/products"
                className="hidden sm:flex items-center px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-900 transition-all"
              >
                Hủy bỏ
              </Link>
              <button
                form="edit-product-form"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-300 shadow-lg active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form id="edit-product-form" onSubmit={handleSubmit}>
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 py-6">
            <div className="grid grid-cols-12 gap-5 items-start">

              {/* ─── LEFT SIDEBAR ─── */}
              <aside className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-20 h-fit">

                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                  <SectionHeader
                    icon={Package}
                    title="Thông tin cơ bản"
                    description="Chỉnh sửa thông tin chính của sản phẩm"
                  />

                  <FormField label="Tên sản phẩm">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-transparent"
                      placeholder="Tên sản phẩm"
                    />
                  </FormField>

                  {/* Slug (read-only) */}
                  <FormField label="Slug (URL)">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      <span className="text-sm font-mono text-slate-400 truncate">
                        /{slug}
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Giá gốc (VNĐ)">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent focus-within:bg-white transition-all px-4 py-2.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={basePrice}
                        onChange={(e) =>
                          setBasePrice(e.target.value.replace(/\D/g, ""))
                        }
                        className="flex-1 bg-transparent text-sm outline-none font-bold"
                      />
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">
                        VNĐ
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Danh mục">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent focus-within:bg-white transition-all">
                      <CategorySelect
                        value={categoryId}
                        onChange={(id) => setCategoryId(id)}
                        categories={categories}
                      />
                    </div>
                  </FormField>

                  <FormField label="Trạng thái bán">
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatus(opt.value)}
                          className={cn(
                            "py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all",
                            status === opt.value
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                              : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-700",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FormField>
                </div>

                {/* Main Images Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <SectionHeader
                    icon={ImageIcon}
                    title="Ảnh chung / Bảng size"
                    description="Ảnh đã lưu (xanh) và ảnh mới (xanh lá)"
                  />
                  <EditableImageDropzone
                    title=""
                    existingImages={existingMainImages}
                    newImages={newMainImages}
                    onAddNew={addNewMainImages}
                    onRemoveExisting={removeExistingMainImage}
                    onRemoveNew={removeNewMainImage}
                    onSetMainExisting={setMainExistingImage}
                    maxImages={3}
                    note="Badge xanh dương = ảnh cloud đã lưu. Badge xanh lá = ảnh mới sẽ upload."
                  />
                </div>
              </aside>

              {/* ─── RIGHT PANEL ─── */}
              <div className="col-span-12 lg:col-span-8 space-y-4">

                {/* Description Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <SectionHeader
                    icon={Type}
                    title="Mô tả sản phẩm"
                    description="Thông tin chi tiết hiển thị cho khách hàng"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-transparent px-4 py-3 text-sm text-slate-700 leading-relaxed transition-all resize-y min-h-[120px]"
                    placeholder="Mô tả chi tiết về sản phẩm..."
                  />
                </div>

                {/* Variants Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <SectionHeader
                    icon={Tag}
                    title="Biến thể sản phẩm"
                    description={`${variants.length} biến thể — Chỉnh sửa màu, size, SKU và giá`}
                    action={
                      <div className="flex items-center gap-2">
                        {variants.length > 0 && (
                          <button
                            type="button"
                            onClick={generateAutoSKUs}
                            className="text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest underline underline-offset-4 transition-colors"
                          >
                            Tự động SKU
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={addColorGroup}
                          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          Thêm màu mới
                        </button>
                      </div>
                    }
                  />

                  <div className="space-y-4">
                    {Array.from(
                      new Set(variants.map((v) => v.color.trim())),
                    ).map((color, cIdx) => {
                      const colorVariants = variants.filter(
                        (v) => v.color.trim() === color,
                      );
                      const colorHexId = colorVariants[0]?.colorHexId;
                      const colorObj = colors.find((c) => c.id === colorHexId);
                      const isPlaceholder = color.startsWith("__NEW_COLOR_");

                      return (
                        <div
                          key={`group-${cIdx}`}
                          className="border border-slate-100 rounded-xl overflow-hidden"
                        >
                          {/* Color Group Header */}
                          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100 gap-3">
                            <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-black">
                                  Tên màu
                                </label>
                                <input
                                  value={isPlaceholder ? "" : color}
                                  onChange={(e) =>
                                    updateColorGroup(color, e.target.value)
                                  }
                                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all w-36"
                                  placeholder="VD: Đen nhám"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-black">
                                  Mã màu chuẩn
                                </label>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: colorObj?.hexCode || "#cbd5e1" }}
                                  />
                                  <div className="w-44">
                                    <ColorDropdown
                                      options={colors}
                                      value={colorHexId}
                                      onChange={(c) =>
                                        updateColorGroup(color, isPlaceholder ? c.name : color, c.id)
                                      }
                                      placeholder={isPlaceholder ? "Chọn màu..." : undefined}
                                    />
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest flex-shrink-0 self-end pb-2">
                                {colorVariants.length} size
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => addSizeToColor(color, colorHexId)}
                                className="flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest border border-slate-200 hover:border-slate-400 rounded-lg px-2.5 py-1.5 transition-all"
                              >
                                <Plus className="w-3 h-3" />
                                Size
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDeleteColorGroup(color)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="Xóa nhóm màu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Variant rows */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-[90px_1fr_100px_40px] gap-3 px-1">
                              {["Size", "SKU", "Giá (đ)", ""].map((h, i) => (
                                <div
                                  key={i}
                                  className="text-[9px] font-black uppercase tracking-widest text-slate-400"
                                >
                                  {h}
                                </div>
                              ))}
                            </div>

                            {colorVariants.map((v) => (
                              <div
                                key={v.id}
                                className="grid grid-cols-[90px_1fr_100px_40px] gap-3 items-center group"
                              >
                                <select
                                  value={v.size}
                                  onChange={(e) =>
                                    updateVariant(v.id, "size", e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
                                >
                                  {SIZES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  value={v.sku}
                                  onChange={(e) =>
                                    updateVariant(v.id, "sku", e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-300"
                                  placeholder="Mã SKU..."
                                />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={v.price}
                                  onChange={(e) =>
                                    updateVariant(
                                      v.id,
                                      "price",
                                      e.target.value.replace(/\D/g, ""),
                                    )
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => confirmDeleteVariant(v.id)}
                                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Xóa biến thể"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Color Images (inline) */}
                          {!isPlaceholder && (
                            <div className="px-4 pb-4 border-t border-slate-100">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 pt-3 mb-3">
                                Ảnh màu {color}
                                <span className="font-normal normal-case tracking-normal text-slate-300 ml-1">
                                  ({(existingColorImages[color] || []).length + (newColorImages[color] || []).length} ảnh)
                                </span>
                              </p>
                              <EditableImageDropzone
                                existingImages={existingColorImages[color] || []}
                                newImages={newColorImages[color] || []}
                                onAddNew={(files) => addNewColorImages(color, files)}
                                onRemoveExisting={(imgId) => removeExistingColorImage(color, imgId)}
                                onRemoveNew={(idx) => removeNewColorImage(color, idx)}
                                maxImages={8}
                                note={`Badge xanh = ảnh đã lưu. Ảnh đầu tiên là ảnh đại diện.`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {variants.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                          Không có biến thể nào
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile save button */}
                <div className="lg:hidden">
                  <button
                    form="edit-product-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-300 shadow-xl active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        <StatusModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteVariant}
          type="warning"
          title="Xác nhận xóa biến thể"
          description="Việc xóa biến thể có thể ảnh hưởng tới tồn kho và đơn hàng đang xử lý. Bạn vẫn có thể hoàn tác khi nhấn Hủy thay đổi ở phía trên."
          confirmText="Tôi chắc chắn"
          cancelText="Để tôi xem lại"
        />

        <StatusModal
          isOpen={colorGroupModalOpen}
          onClose={() => setColorGroupModalOpen(false)}
          onConfirm={handleDeleteColorGroup}
          type="warning"
          title="Xác nhận xóa nhóm màu"
          description="Toàn bộ biến thể thuộc nhóm màu này sẽ bị xóa. Thao tác có thể ảnh hưởng tới tồn kho và đơn hàng đang xử lý."
          confirmText="Xóa nhóm màu"
          cancelText="Để tôi xem lại"
        />
      </div>
    </RoleGuard>
  );
}
