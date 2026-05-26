"use client";

import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  Type,
  Tag,
  Image as ImageIcon,
  Palette,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { MainImageDropzone } from "@/components/ui/ImageDropzone";
import { ColorDropdown } from "@/components/ui/ColorDropdown";
import { STATUS_OPTIONS, SIZES } from "@/constants/product";
import { LoadingLayer } from "@/components/ui/LoadingLayer";
import { useProductCreate } from "@/hooks/product/useProductCreate";
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
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[10px] text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CreateProductPage() {
  const {
    name,
    slug,
    setSlug,
    description,
    setDescription,
    basePrice,
    setBasePrice,
    categoryId,
    setCategoryId,
    status,
    setStatus,
    variants,
    mainImages,
    colorImages,
    isSubmitting,
    loadingMessage,
    categories,
    colors,
    errors,
    handleNameChange,
    addVariant,
    addSizeToColor,
    updateVariant,
    updateColorGroup,
    removeVariant,
    removeColorGroup,
    handleColorImages,
    removeColorImage,
    handleSetMainColorImage,
    handleMainImages,
    removeMainImage,
    handleSetMainImage,
    generateAutoSKUs,
    handleSubmit,
  } = useProductCreate();

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
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Link
                  href="/admin/products"
                  className="hover:text-slate-900 transition-colors"
                >
                  Sản phẩm
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-900 font-bold">Thêm mới</span>
              </div>
              <div className="sm:hidden font-black text-slate-900 uppercase tracking-tight text-sm truncate">
                Thêm sản phẩm mới
              </div>
            </div>

            {/* Title — desktop center */}
            <div className="hidden lg:block text-center flex-shrink-0">
              <p className="font-black text-slate-900 uppercase tracking-tight">
                Thêm sản phẩm mới
              </p>
              {slug && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  /{slug}
                </p>
              )}
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
                form="create-product-form"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-300 shadow-lg active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form id="create-product-form" onSubmit={handleSubmit}>
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 py-6">
            <div className="grid grid-cols-12 gap-5 items-start">

              {/* ─── LEFT SIDEBAR ─── */}
              <aside className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-20 h-fit">

                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                  <SectionHeader
                    icon={Package}
                    title="Thông tin cơ bản"
                    description="Tên, giá và phân loại sản phẩm"
                  />

                  <FormField label="Tên sản phẩm" required error={errors.name}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={cn(
                        "w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none transition-all",
                        "focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-transparent",
                        errors.name ? "border-red-300" : "border-slate-200",
                      )}
                      placeholder="VD: Quần tây nam ống suông"
                    />
                  </FormField>

                  <FormField
                    label="Slug (URL)"
                    required
                    hint="Tự động tạo từ tên sản phẩm, có thể chỉnh sửa"
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent focus-within:bg-white transition-all px-4 py-2.5">
                      <span className="text-slate-400 text-sm font-mono flex-shrink-0">/</span>
                      <input
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none font-mono text-slate-600 placeholder:text-slate-300"
                        placeholder="quan-tay-nam-ong-rong"
                      />
                    </div>
                  </FormField>

                  <FormField label="Giá gốc (VNĐ)" required>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent focus-within:bg-white transition-all px-4 py-2.5">
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        value={basePrice}
                        onChange={(e) =>
                          setBasePrice(e.target.value.replace(/\D/g, ""))
                        }
                        className="flex-1 bg-transparent text-sm outline-none font-bold placeholder:text-slate-300 placeholder:font-normal"
                        placeholder="350000"
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
                    description="Hướng dẫn chọn size, quy cách đóng gói"
                  />
                  <MainImageDropzone
                    title=""
                    images={mainImages}
                    onAdd={handleMainImages}
                    onRemove={removeMainImage}
                    onSetMain={handleSetMainImage}
                    maxImages={3}
                    isMainPanel={true}
                    note="Upload bảng Size hoặc ảnh quy cách đóng gói chung."
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
                    placeholder="Mô tả chi tiết về chất liệu, kiểu dáng, ứng dụng của sản phẩm..."
                  />
                </div>

                {/* Variants Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <SectionHeader
                    icon={Tag}
                    title="Biến thể sản phẩm"
                    description={`${variants.length} biến thể — Cấu hình màu sắc, size và giá riêng`}
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
                          onClick={addVariant}
                          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          Thêm màu
                        </button>
                      </div>
                    }
                  />

                  {variants.length === 0 ? (
                    <div className="py-14 text-center border-2 border-dashed border-slate-100 rounded-xl">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Palette className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Chưa có biến thể nào
                      </p>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="text-[11px] font-black text-slate-900 uppercase tracking-widest underline underline-offset-4 hover:no-underline transition-all"
                      >
                        Thêm màu sắc đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.from(
                        new Set(variants.map((v) => v.color.trim())),
                      ).map((color, cIdx) => {
                        const colorVariants = variants.filter(
                          (v) => v.color.trim() === color,
                        );
                        const currentColorHexId = colorVariants[0]?.colorHexId;
                        const isPlaceholder = color.startsWith("__NEW_");
                        const cImages = colorImages[color] || [];

                        return (
                          <div
                            key={colorVariants[0]?.id || `group-${cIdx}`}
                            className="border border-slate-100 rounded-xl overflow-hidden"
                          >
                            {/* Color Group Header */}
                            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100">
                              <div className="flex items-center gap-4 flex-wrap">
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
                                  <div className="w-44">
                                    <ColorDropdown
                                      options={colors}
                                      value={currentColorHexId}
                                      onChange={(newColorObj) => {
                                        updateColorGroup(
                                          color,
                                          newColorObj.name,
                                          newColorObj.id,
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeColorGroup(color)}
                                className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Size Rows */}
                            <div className="p-4 space-y-3">
                              {/* Table header */}
                              <div className="grid grid-cols-[100px_1fr_110px_40px] gap-3 px-1">
                                {["Size", "Mã SKU", "Giá riêng (đ)", ""].map(
                                  (h, i) => (
                                    <div
                                      key={i}
                                      className="text-[9px] font-black uppercase tracking-widest text-slate-400"
                                    >
                                      {h}
                                    </div>
                                  ),
                                )}
                              </div>

                              {colorVariants.map((v) => (
                                <div
                                  key={v.id}
                                  className="grid grid-cols-[100px_1fr_110px_40px] gap-3 items-center group"
                                >
                                  <select
                                    value={v.size}
                                    onChange={(e) =>
                                      updateVariant(v.id, "size", e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
                                  >
                                    <option value="">— Size —</option>
                                    {SIZES.map((s) => {
                                      const isUsed = colorVariants.some(
                                        (cv) => cv.size === s && cv.id !== v.id,
                                      );
                                      return (
                                        <option
                                          key={s}
                                          value={s}
                                          disabled={isUsed}
                                        >
                                          {s}
                                          {isUsed ? " ✓" : ""}
                                        </option>
                                      );
                                    })}
                                  </select>

                                  <input
                                    value={v.sku}
                                    onChange={(e) =>
                                      updateVariant(v.id, "sku", e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-300"
                                    placeholder="SKU-001"
                                  />

                                  <input
                                    type="number"
                                    value={v.price}
                                    onChange={(e) =>
                                      updateVariant(v.id, "price", e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-300"
                                    placeholder="Tùy chọn"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => removeVariant(v.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() =>
                                  addSizeToColor(color, currentColorHexId)
                                }
                                className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-slate-900 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm size cho màu {isPlaceholder ? "này" : color}
                              </button>
                            </div>

                            {/* Color Images (inline) */}
                            <div className="px-4 pb-4 border-t border-slate-100">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 pt-3 mb-3">
                                Ảnh màu {isPlaceholder ? "này" : color}
                                <span className="font-normal normal-case tracking-normal text-slate-300 ml-1">({cImages.length} ảnh)</span>
                              </p>
                              <MainImageDropzone
                                images={cImages}
                                onAdd={(files) => handleColorImages(color, files)}
                                onRemove={(idx) => removeColorImage(color, idx)}
                                onSetMain={(idx) => handleSetMainColorImage(color, idx)}
                                maxImages={8}
                                note="Ảnh đầu tiên sẽ là ảnh đại diện cho màu này."
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Add new color group */}
                      <button
                        type="button"
                        onClick={addVariant}
                        className="w-full py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm nhóm màu mới
                      </button>
                    </div>
                  )}

                  {errors.variants && (
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {errors.variants}
                    </p>
                  )}
                </div>

                {/* Mobile save button */}
                <div className="lg:hidden">
                  <button
                    form="create-product-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-300 shadow-xl active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
