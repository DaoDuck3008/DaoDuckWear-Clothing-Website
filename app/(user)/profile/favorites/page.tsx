"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavoriteStore } from "@/stores/favorite.store";
import { StatusModal } from "@/components/ui/StatusModal";
import { toast } from "react-toastify";
import { Heart, Trash2, ExternalLink, ShoppingBag } from "lucide-react";

// ── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-stone-100 rounded-full w-4/5" />
        <div className="h-3 bg-stone-100 rounded-full w-2/5" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 bg-stone-100 rounded-xl flex-1" />
          <div className="h-8 w-8 bg-stone-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FavoritesProfilePage() {
  const { items, fetchFavorites, removeItem, clearFavorites } = useFavoriteStore();
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  useEffect(() => {
    fetchFavorites().finally(() => setLoading(false));
  }, [fetchFavorites]);

  const handleRemove = async (id: string, name: string) => {
    setRemovingId(id);
    try {
      await removeItem(id);
      toast.success(`Đã xóa "${name}" khỏi yêu thích`);
    } catch {
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearFavorites();
      toast.success("Đã xóa tất cả sản phẩm yêu thích");
    } catch {
      toast.error("Không thể xóa danh sách");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">
            Yêu thích
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-1">
            {loading ? (
              <span className="inline-block w-24 h-3 bg-stone-100 rounded-full animate-pulse" />
            ) : (
              <>
                <span className="text-black font-bold">{items.length}</span> sản phẩm đã lưu
              </>
            )}
          </p>
        </div>

        {!loading && items.length > 0 && (
          <button
            onClick={() => setClearModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-stone-200">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <Heart className="w-9 h-9 text-rose-200" />
          </div>
          <h3 className="text-base font-black text-black uppercase tracking-tight">
            Danh sách trống
          </h3>
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-2 text-center px-6">
            Lưu những món đồ bạn yêu thích để dễ tìm lại sau
          </p>
          <Link
            href="/products"
            className="mt-7 flex items-center gap-2 px-7 py-3 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.18em] hover:scale-105 active:scale-95 transition-all shadow-md shadow-stone-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md hover:border-stone-200 transition-all duration-200"
            >
              {/* Image */}
              <Link href={`/products/${item.slug}`} className="block">
                <div className="aspect-square overflow-hidden bg-stone-50 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-stone-200" />
                    </div>
                  )}
                  {/* Heart badge */}
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  </div>
                </div>
              </Link>

              {/* Info */}
              <div className="p-3.5 space-y-2">
                <Link href={`/products/${item.slug}`}>
                  <p className="text-[11px] font-bold text-stone-800 uppercase tracking-tight line-clamp-2 hover:text-black transition-colors leading-tight">
                    {item.name}
                  </p>
                </Link>
                <p className="text-sm font-black text-black">
                  {item.price.toLocaleString("vi-VN")}đ
                </p>

                <div className="flex gap-2 pt-0.5">
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-stone-800 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Xem
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    disabled={removingId === item.id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-100 text-stone-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Confirm clear all modal ── */}
      <StatusModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        type="warning"
        title="Xóa tất cả yêu thích?"
        description="Hành động này sẽ xóa toàn bộ danh sách yêu thích của bạn và không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        onConfirm={handleClearAll}
      />
    </div>
  );
}
