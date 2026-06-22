"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, Store, Check } from "lucide-react";
import { DropdownPortal } from "./DropdownPortal";

export interface Shop {
  id: string;
  name: string;
  cityName?: string;
}

interface ShopSelectProps {
  value: string;
  onChange: (id: string) => void;
  shops: Shop[];
  error?: string;
}

export function ShopSelect({ value, onChange, shops, error }: ShopSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedShop = shops.find((s) => s.id === value);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full bg-stone-50 border ${
          error ? "border-red-300" : "border-stone-100"
        } hover:border-stone-300 px-4 py-3 flex items-center justify-between transition-all group`}
      >
        <div className="flex items-center gap-3">
          <Store className={`w-4 h-4 ${value ? "text-black" : "text-stone-300"}`} />
          <span className={`text-sm tracking-wide ${value ? "text-black font-medium" : "text-stone-400"}`}>
            {selectedShop ? selectedShop.name : "Chọn chi nhánh cửa hàng"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-300 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-black" : ""
          }`}
        />
      </button>

      <DropdownPortal
        anchorRef={triggerRef}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        estimatedHeight={260}
        className="bg-white border border-stone-100 shadow-xl overflow-hidden animate-in fade-in duration-200"
      >
        <div className="max-h-[240px] overflow-y-auto">
          {shops.length === 0 ? (
            <div className="p-4 text-center text-xs uppercase tracking-widest text-stone-400">
              Không tìm thấy chi nhánh nào
            </div>
          ) : (
            shops.map((shop) => (
              <button
                key={shop.id}
                type="button"
                onClick={() => {
                  onChange(shop.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors ${
                  value === shop.id ? "bg-stone-50" : ""
                }`}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`text-sm tracking-wide ${value === shop.id ? "font-bold text-black" : "text-stone-600"}`}>
                    {shop.name}
                  </span>
                  {shop.cityName && (
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      {shop.cityName}
                    </span>
                  )}
                </div>
                {value === shop.id && <Check className="w-4 h-4 text-black" />}
              </button>
            ))
          )}
        </div>
      </DropdownPortal>

      {error && (
        <p className="text-red-500 text-[10px] uppercase mt-1.5 tracking-wider font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
