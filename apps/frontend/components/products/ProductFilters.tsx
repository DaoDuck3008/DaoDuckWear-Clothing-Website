"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { colorApi } from "@/apis/color.api";
import { categoryApi } from "@/apis/category.api";
import { SIZES } from "@/constants/product";
import { handleApiError } from "@/utils/error.util";

interface FilterParams {
  categoryId?: string;
  colorHexId?: string | string[];
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

interface ProductFiltersProps {
  params: FilterParams;
  onChange: (newParams: FilterParams) => void;
  onClear: () => void;
}

export default function ProductFilters({
  params,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsRes, categoriesRes] = await Promise.all([
          colorApi.getAll(),
          categoryApi.getCategories(),
        ]);
        setColors(colorsRes.data);
        setCategories(categoriesRes);
      } catch (error) {
        handleApiError(
          error,
          "Lấy danh sách màu sắc và danh mục sản phẩm thất bại",
        );
      }
    };
    fetchData();
  }, []);

  const PRICE_RANGES = [
    { label: "Dưới 200k", min: 0, max: 200000 },
    { label: "200k - 500k", min: 200000, max: 500000 },
    { label: "500k - 1tr", min: 500000, max: 1000000 },
    { label: "Trên 1tr", min: 1000000, max: 10000000 },
  ];

  const handleColorToggle = (colorId: string) => {
    const currentColors = Array.isArray(params.colorHexId)
      ? params.colorHexId
      : params.colorHexId
        ? [params.colorHexId]
        : [];

    let newColors: string[];
    if (currentColors.includes(colorId)) {
      newColors = currentColors.filter((id) => id !== colorId);
    } else {
      newColors = [...currentColors, colorId];
    }

    onChange({
      ...params,
      colorHexId: newColors.length > 0 ? newColors : undefined,
    });
  };

  const isColorSelected = (colorId: string) => {
    const currentColors = Array.isArray(params.colorHexId)
      ? params.colorHexId
      : params.colorHexId
        ? [params.colorHexId]
        : [];
    return currentColors.includes(colorId);
  };

  return (
    <div className="w-full bg-white border-b border-stone-100 top-16 z-30">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onChange({ ...params, categoryId: undefined })}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
              !params.categoryId
                ? "bg-black text-white border-black"
                : "bg-white text-stone-400 border-stone-200 hover:border-black hover:text-black",
            )}
          >
            Tất cả sản phẩm
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange({ ...params, categoryId: cat.id })}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                params.categoryId === cat.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-stone-400 border-stone-200 hover:border-black hover:text-black",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 border transition-all",
            isOpen
              ? "bg-black text-white border-black"
              : "bg-white border-stone-200",
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Bộ lọc
          </span>
          {isOpen ? <X className="w-3 h-3" /> : <Filter className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Filter Panel */}
      <div
        className={cn(
          "bg-white border-t border-stone-100 transition-all duration-500 overflow-hidden",
          isOpen
            ? "max-h-[1000px] opacity-100 py-10"
            : "max-h-0 opacity-0 py-0",
        )}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Color Filter */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
              Màu sắc
            </h3>
            <div className="grid grid-cols-5 gap-1">
              {colors &&
                colors.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => handleColorToggle(color._id)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 transition-all",
                      isColorSelected(color._id)
                        ? "scale-110"
                        : "hover:scale-110",
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center transition-all"
                      style={{ backgroundColor: color.hexCode }}
                    >
                      {isColorSelected(color.id) && (
                        <Check
                          className={cn(
                            "w-4 h-4",
                            color.hexCode.toUpperCase() === "#FFFFFF"
                              ? "text-black"
                              : "text-white",
                          )}
                        />
                      )}
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
              Kích thước
            </h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    onChange({
                      ...params,
                      size: params.size === size ? undefined : size,
                    })
                  }
                  className={cn(
                    "min-w-[40px] h-10 flex items-center justify-center border text-[11px] font-bold transition-all",
                    params.size === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-stone-400 border-stone-200 hover:border-black hover:text-black",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
              Khoảng giá
            </h3>
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() =>
                    onChange({
                      ...params,
                      minPrice: range.min,
                      maxPrice: range.max,
                    })
                  }
                  className={cn(
                    "w-full text-left py-2 text-[11px] font-bold uppercase tracking-widest transition-all border-b border-transparent",
                    params.minPrice === range.min &&
                      params.maxPrice === range.max
                      ? "text-black border-black"
                      : "text-stone-400 hover:text-black",
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
              Sắp xếp
            </h3>
            <div className="space-y-2">
              {[
                { label: "Mới nhất", value: "newest" },
                { label: "Giá cao nhất", value: "price_desc" },
                { label: "Giá thấp nhất", value: "price_asc" },
                { label: "Bán chạy", value: "bestseller" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...params, sort: opt.value })}
                  className={cn(
                    "w-full text-left py-2 text-[11px] font-bold uppercase tracking-widest transition-all border-b border-transparent",
                    params.sort === opt.value
                      ? "text-black border-black"
                      : "text-stone-400 hover:text-black",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 mt-12 flex justify-end gap-4 border-t border-stone-50 pt-8">
          <button
            onClick={() => {
              onClear();
              setIsOpen(false);
            }}
            className="px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-10 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
