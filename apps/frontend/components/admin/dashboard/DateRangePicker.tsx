"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

export type RangePreset = "today" | "7d" | "30d" | "custom";

export interface DateRangeValue {
  preset: RangePreset;
  fromDate: string;
  toDate: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
}

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "today", label: "Hôm nay" },
  { key: "7d", label: "7 ngày" },
  { key: "30d", label: "30 ngày" },
  { key: "custom", label: "Tùy chọn" },
];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeRange(preset: RangePreset): {
  fromDate: string;
  toDate: string;
} {
  const today = new Date();
  const toDate = isoDate(today);
  if (preset === "today") return { fromDate: toDate, toDate };
  if (preset === "30d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { fromDate: isoDate(from), toDate };
  }
  // default 7d
  const from = new Date(today);
  from.setDate(from.getDate() - 6);
  return { fromDate: isoDate(from), toDate };
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [customFrom, setCustomFrom] = useState(value.fromDate);
  const [customTo, setCustomTo] = useState(value.toDate);

  const handlePreset = (preset: RangePreset) => {
    if (preset === "custom") {
      onChange({ preset, fromDate: customFrom, toDate: customTo });
      return;
    }
    const range = computeRange(preset);
    onChange({ preset, ...range });
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    if (new Date(customFrom) > new Date(customTo)) return;
    onChange({ preset: "custom", fromDate: customFrom, toDate: customTo });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePreset(p.key)}
            className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-full transition",
              value.preset === p.key
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {value.preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-stone-900"
          />
          <span className="text-stone-400 text-sm">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-stone-900"
          />
          <button
            type="button"
            onClick={applyCustom}
            className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs uppercase tracking-widest font-bold text-white hover:bg-stone-800 transition"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
}
