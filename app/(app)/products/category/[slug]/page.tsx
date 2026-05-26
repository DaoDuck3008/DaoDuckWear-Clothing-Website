"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductFilters from "@/components/products/ProductFilters";
import ProductCard from "@/components/products/ProductCard";
import { ProductFilterSkeleton, ProductGridSkeleton } from "@/components/products/ProductSkeletons";
import { productApi } from "@/apis/product.api";
import { categoryApi } from "@/apis/category.api";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { handleApiError } from "@/utils/error.util";

export default function CategoryProductsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [queryParams, setQueryParams] = useState<any>({
    page: 1,
    limit: 12,
  });

  // 1. Fetch Category Info
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categories = await categoryApi.getCategories();
        const findCategory = (list: any[]): any => {
          for (const item of list) {
            if (item.slug === slug) return item;
            if (item.children) {
              const found = findCategory(item.children);
              if (found) return found;
            }
          }
          return null;
        };

        const currentCat = findCategory(categories);
        if (currentCat) {
          setCategory(currentCat);
          setQueryParams((prev: any) => ({ ...prev, categoryId: currentCat.id }));
        }
      } catch (error) {
        console.error("Lấy thông tin danh mục thất bại:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (slug) fetchCategoryData();
  }, [slug]);

  // 2. Fetch Products
  useEffect(() => {
    if (!queryParams.categoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts(queryParams);
        setProducts(res.data);
        setTotal(res.total);
      } catch (error) {
        handleApiError(error, "Lấy danh sách sản phẩm thất bại");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [queryParams]);

  const handleFilterChange = (newParams: any) => {
    setQueryParams({ ...queryParams, ...newParams, page: 1 });
  };

  const handleClearFilters = () => {
    setQueryParams({ page: 1, limit: 12, categoryId: category?.id });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-12 bg-stone-50 border-b border-stone-100" />
        <ProductFilterSkeleton />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12">
           <div className="h-10 w-48 bg-stone-100 mb-10 animate-pulse" />
           <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (!category && !initialLoading) {
     return (
        <div className="py-40 text-center uppercase tracking-widest text-stone-400">
           Danh mục không tồn tại
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          <Link href="/" className="hover:text-black transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-black transition-colors">
            Sản phẩm
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-bold uppercase">{category?.name}</span>
        </div>
      </div>

      {/* Filters Header */}
      <ProductFilters
        params={queryParams}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Product Grid */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-cormorant font-bold tracking-tight uppercase italic">
              {category?.name}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-2">
              Bộ sưu tập đặc biệt của chúng tôi • {total} sản phẩm
            </p>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={queryParams.limit} />
        ) : products.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-stone-100">
            <p className="text-sm uppercase tracking-widest text-stone-400">
              Chưa có sản phẩm nào trong danh mục này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination placeholder */}
        {total > queryParams.limit && (
          <div className="mt-20 flex justify-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center border border-black bg-black text-white text-xs font-bold transition-all">
              1
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
