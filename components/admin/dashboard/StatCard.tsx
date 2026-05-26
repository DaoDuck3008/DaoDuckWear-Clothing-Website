"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  loading?: boolean;
  accent?: "rose" | "stone" | "emerald" | "indigo";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  rose: "text-rose-700 bg-rose-50",
  stone: "text-stone-700 bg-stone-100",
  emerald: "text-emerald-700 bg-emerald-50",
  indigo: "text-indigo-700 bg-indigo-50",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading,
  accent = "stone",
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col gap-3 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-widest text-[10px] font-bold text-stone-500">
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center",
              ACCENTS[accent],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="font-serif text-3xl font-bold tracking-tight text-stone-900 min-h-[2.25rem]">
        {loading ? (
          <span className="inline-block h-7 w-24 rounded bg-stone-100 animate-pulse" />
        ) : (
          value
        )}
      </div>
      {hint && (
        <p className="text-xs text-stone-500 italic line-clamp-1">{hint}</p>
      )}
    </div>
  );
}
