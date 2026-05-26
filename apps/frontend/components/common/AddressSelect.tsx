"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Loader2, X } from "lucide-react";
import { provinceApi } from "@/apis/province.api";
import { cn } from "@/utils/cn";

interface AddressSelectProps {
  label: string;
  type: "province" | "ward";
  parentCode?: number;
  value: string;
  onSelect: (name: string, code: number) => void;
  disabled?: boolean;
}

export default function AddressSelect({
  label,
  type,
  parentCode,
  value,
  onSelect,
  disabled = false,
}: AddressSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    if (disabled) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (type === "province") {
          data = await provinceApi.getProvinces();
        } else if (type === "ward" && parentCode) {
          data = await provinceApi.getWards(parentCode);
        }
        setOptions(data);
      } catch (error) {
        console.error("Failed to fetch address data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, parentCode, disabled]);

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative font-outfit" ref={dropdownRef}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
        {label}
      </label>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer transition-all duration-300",
          isOpen
            ? "border-black bg-white ring-1 ring-black/5"
            : "hover:bg-white",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className={cn("text-sm", !value && "text-stone-400")}>
          {value || `Chọn ${label}`}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-stone-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Search Bar */}
          <div className="p-3 border-b border-stone-50 bg-stone-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              autoFocus
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <X
                className="w-3 h-3 text-stone-400 cursor-pointer hover:text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch("");
                }}
              />
            )}
          </div>

          {/* List Options */}
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                <span className="text-[10px] uppercase tracking-widest text-stone-400">
                  Đang tải dữ liệu...
                </span>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.code}
                  onClick={() => {
                    onSelect(opt.name, opt.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between group",
                    value === opt.name
                      ? "bg-black text-white"
                      : "hover:bg-stone-50",
                  )}
                >
                  <span className="font-medium">{opt.name}</span>
                  {value === opt.name && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <span className="text-xs text-stone-400 italic">
                  Không tìm thấy kết quả
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
