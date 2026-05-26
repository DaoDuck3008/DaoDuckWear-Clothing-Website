"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RevenuePoint } from "@/apis/analytics.api";
import { formatPrice } from "@/utils/format.util";

interface RevenueChartProps {
  data: RevenuePoint[];
  loading?: boolean;
}

function shortMoney(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

function shortDate(d: string) {
  // d is YYYY-MM-DD
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const isEmpty =
    !loading && data.length > 0 && data.every((d) => d.revenue === 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 h-[360px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900">
          Doanh thu theo ngày
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          theo ngày thanh toán
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-full w-full rounded-xl bg-stone-50 animate-pulse" />
        </div>
      ) : isEmpty || data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-stone-400 text-sm italic">
          Chưa có dữ liệu trong khoảng thời gian này
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b91446" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#b91446" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickFormatter={shortDate}
              tickLine={false}
              axisLine={{ stroke: "#e7e5e4" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickFormatter={shortMoney}
              tickLine={false}
              axisLine={{ stroke: "#e7e5e4" }}
              width={50}
            />
            <Tooltip
              cursor={{ stroke: "#b91446", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7e5e4",
                fontSize: 12,
                padding: "8px 12px",
              }}
              labelFormatter={(label) => `Ngày ${shortDate(String(label))}`}
              formatter={((value: number) => [
                formatPrice(value),
                "Doanh thu",
              ]) as never}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#b91446"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
