"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryBucket } from "@/apis/analytics.api";

interface ProductsByCategoryChartProps {
  data: CategoryBucket[];
  loading?: boolean;
}

const PALETTE = [
  "#b91446",
  "#0ea5e9",
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
  "#a8a29e",
];

const colorFor = (name: string, index: number) =>
  name === "Khác" ? "#a8a29e" : PALETTE[index % PALETTE.length];

export function ProductsByCategoryChart({
  data,
  loading,
}: ProductsByCategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 h-[360px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900">
          Sản phẩm theo danh mục
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {total} sp
        </span>
      </div>

      {loading ? (
        <div className="flex-1 rounded-xl bg-stone-50 animate-pulse" />
      ) : total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-stone-400 text-sm italic">
          Chưa có sản phẩm
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={entry.categoryId ?? `cat-${idx}`}
                      fill={colorFor(entry.name, idx)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e7e5e4",
                    fontSize: 12,
                    padding: "8px 12px",
                  }}
                  formatter={
                    ((
                      value: number,
                      _name: string,
                      props: { payload?: CategoryBucket },
                    ) => {
                      const pct = total > 0 ? (value / total) * 100 : 0;
                      return [
                        `${value} sp (${pct.toFixed(1)}%)`,
                        props?.payload?.name ?? "",
                      ];
                    }) as never
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-600 max-h-[72px] overflow-auto">
            {data.map((entry, idx) => (
              <li
                key={entry.categoryId ?? `cat-legend-${idx}`}
                className="inline-flex items-center gap-1.5"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: colorFor(entry.name, idx) }}
                />
                <span className="truncate max-w-[120px]">{entry.name}</span>
                <span className="text-stone-400 tabular-nums">
                  {entry.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
