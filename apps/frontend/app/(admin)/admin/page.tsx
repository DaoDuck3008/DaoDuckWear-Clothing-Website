"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  analyticsApi,
  CategoryBucket,
  RecentOrder,
  RevenuePoint,
  StatusBucket,
  SummaryResponse,
  TopProduct,
} from "@/apis/analytics.api";
import { useAuthStore } from "@/stores/auth.store";
import { formatPrice } from "@/utils/format.util";
import { handleApiError } from "@/utils/error.util";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import {
  computeRange,
  DateRangePicker,
  DateRangeValue,
} from "@/components/admin/dashboard/DateRangePicker";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { OrdersByStatusChart } from "@/components/admin/dashboard/OrdersByStatusChart";
import { TopProductsTable } from "@/components/admin/dashboard/TopProductsTable";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { ProductsByCategoryChart } from "@/components/admin/dashboard/ProductsByCategoryChart";

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const [range, setRange] = useState<DateRangeValue>(() => ({
    preset: "7d",
    ...computeRange("7d"),
  }));

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [statusBuckets, setStatusBuckets] = useState<StatusBucket[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryBucket[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useMemo(
    () => ({ fromDate: range.fromDate, toDate: range.toDate }),
    [range.fromDate, range.toDate],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [s, r, sb, tp, ro, cs] = await Promise.all([
          analyticsApi.getSummary(params),
          analyticsApi.getRevenueSeries(params),
          analyticsApi.getOrdersByStatus(params),
          analyticsApi.getTopProducts(params),
          analyticsApi.getRecentOrders(params),
          analyticsApi.getProductsByCategory(params),
        ]);
        if (cancelled) return;
        setSummary(s);
        setRevenue(r);
        setStatusBuckets(sb);
        setTopProducts(tp);
        setRecentOrders(ro);
        setCategoryStats(cs);
      } catch (err) {
        if (!cancelled) handleApiError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const isAdmin = role === "ADMIN";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tighter uppercase text-stone-900">
            Tổng quan
          </h1>
          <p className="text-stone-500 text-sm italic mt-1">
            {isAdmin
              ? "Thống kê toàn hệ thống"
              : user?.shop?.name
                ? `Thống kê cửa hàng: ${user.shop.name}`
                : "Thống kê cửa hàng của bạn"}
          </p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <section
        className={
          isAdmin
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        }
      >
        <StatCard
          label="Doanh thu"
          value={formatPrice(summary?.revenue ?? 0)}
          hint="Đơn đã thanh toán trong khoảng"
          icon={<DollarSign className="h-4 w-4" />}
          accent="rose"
          loading={loading}
        />
        <StatCard
          label="Số đơn hàng"
          value={(summary?.orderCount ?? 0).toLocaleString("vi-VN")}
          hint="Đơn đã thanh toán trong khoảng"
          icon={<ShoppingBag className="h-4 w-4" />}
          accent="indigo"
          loading={loading}
        />
        <StatCard
          label="Giá trị đơn TB"
          value={formatPrice(summary?.avgOrderValue ?? 0)}
          hint="Doanh thu / số đơn"
          icon={<TrendingUp className="h-4 w-4" />}
          accent="emerald"
          loading={loading}
        />
        {isAdmin ? (
          <>
            <StatCard
              label="Khách hàng"
              value={(summary?.customerCount ?? 0).toLocaleString("vi-VN")}
              hint="Tổng tài khoản đã đăng ký"
              icon={<Users className="h-4 w-4" />}
              accent="stone"
              loading={loading}
            />
            <StatCard
              label="Tổng sản phẩm"
              value={(summary?.totalProducts ?? 0).toLocaleString("vi-VN")}
              hint="Toàn hệ thống"
              icon={<Boxes className="h-4 w-4" />}
              accent="indigo"
              loading={loading}
            />
          </>
        ) : (
          <StatCard
            label="SP trong shop"
            value={(summary?.productCount ?? 0).toLocaleString("vi-VN")}
            hint="Sản phẩm có trong kho"
            icon={<Package className="h-4 w-4" />}
            accent="stone"
            loading={loading}
          />
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} loading={loading} />
        </div>
        <div>
          <OrdersByStatusChart data={statusBuckets} loading={loading} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ProductsByCategoryChart data={categoryStats} loading={loading} />
        <TopProductsTable data={topProducts} loading={loading} />
        <RecentOrdersTable data={recentOrders} loading={loading} />
      </section>
    </div>
  );
}
