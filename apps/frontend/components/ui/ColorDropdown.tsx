"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface ColorOption {
  id: string;
  name: string;
  slug: string;
  hexCode: string;
}

interface ColorDropdownProps {
  options: ColorOption[];
  value?: string;
  onChange: (color: ColorOption) => void;
  placeholder?: string;
  className?: string;
}

export function ColorDropdown({
  options,
  value,
  onChange,
  placeholder = "Chọn mã màu...",
  className,
}: ColorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-transparent border-b border-stone-200 hover:border-black py-0.5 transition-colors text-left"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selected ? (
            <>
              <div
                className="w-3 h-3 rounded-full border border-stone-200 shrink-0"
                style={{ backgroundColor: selected.hexCode }}
              />
              <span className="text-sm font-bold uppercase tracking-wider truncate">
                {selected.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-stone-300 italic">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-stone-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-stone-100 shadow-xl z-50 max-h-60 overflow-y-auto no-scrollbar">
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-[10px] uppercase tracking-widest text-stone-400">
              Không có dữ liệu màu
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0",
                  value === opt.id && "bg-stone-50",
                )}
              >
                <div
                  className="w-4 h-4 rounded-full border border-stone-200 shrink-0"
                  style={{ backgroundColor: opt.hexCode }}
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest leading-none">
                    {opt.name}
                  </span>
                  <span className="text-[9px] text-stone-400 mt-0.5 font-mono uppercase">
                    {opt.hexCode}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
