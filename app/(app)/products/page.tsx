"use client";

import React, { useState, useEffect } from "react";
import ProductFilters from "@/components/products/ProductFilters";
import ProductCard from "@/components/products/ProductCard";
import { ProductFilterSkeleton, ProductGridSkeleton } from "@/components/products/ProductSkeletons";
import { productApi } from "@/apis/product.api";
import { handleApiError } from "@/utils/error.util";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 12,
    categoryId: undefined,
    colorHexId: undefined,
    size: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sort: undefined,
  });

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

  useEffect(() => {
    fetchProducts();
  }, [queryParams]);

  const handleFilterChange = (newParams: any) => {
    setQueryParams({ ...queryParams, ...newParams, page: 1 });
  };

  const handleClearFilters = () => {
    setQueryParams({
      page: 1,
      limit: 12,
      categoryId: undefined,
      colorHexId: undefined,
      size: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Filters Header */}
      {loading && products.length === 0 ? (
        <ProductFilterSkeleton />
      ) : (
        <ProductFilters
          params={queryParams}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      )}

      {/* Product Grid */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-cormorant font-bold tracking-tight uppercase italic">
              Tất cả sản phẩm
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-2">
              Khám phá bộ sưu tập mới nhất của chúng tôi • {total} sản phẩm
            </p>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={queryParams.limit} />
        ) : products.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-stone-100">
            <p className="text-sm uppercase tracking-widest text-stone-400">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc
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
