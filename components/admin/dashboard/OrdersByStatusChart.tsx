"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBucket } from "@/apis/analytics.api";

interface OrdersByStatusChartProps {
  data: StatusBucket[];
  loading?: boolean;
}

const STATUS_LABEL: Record<StatusBucket["status"], string> = {
  PENDING: "Chờ XN",
  CONFIRMED: "Đã XN",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const STATUS_COLOR: Record<StatusBucket["status"], string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#0ea5e9",
  SHIPPING: "#6366f1",
  COMPLETED: "#10b981",
  CANCELLED: "#a8a29e",
};

export function OrdersByStatusChart({
  data,
  loading,
}: OrdersByStatusChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: STATUS_LABEL[d.status],
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 h-[360px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900">
          Đơn hàng theo trạng thái
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {total} đơn
        </span>
      </div>

      {loading ? (
        <div className="flex-1 rounded-xl bg-stone-50 animate-pulse" />
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#e7e5e4" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#e7e5e4" }}
              allowDecimals={false}
              width={30}
            />
            <Tooltip
              cursor={{ fill: "#f5f5f4" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7e5e4",
                fontSize: 12,
                padding: "8px 12px",
              }}
              formatter={((value: number) => [value, "Số đơn"]) as never}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} minPointSize={2}>
              <LabelList
                dataKey="count"
                position="top"
                fill="#44403c"
                fontSize={11}
                fontWeight={600}
              />
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
