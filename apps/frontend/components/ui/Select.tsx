"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { DropdownPortal } from "./DropdownPortal";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Chọn giá trị...",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-transparent border-b border-stone-200 hover:border-black py-2.5 text-sm transition-colors text-left focus:outline-none"
      >
        <span
          className={
            selectedOption
              ? "text-black font-medium text-sm"
              : "text-stone-400 text-sm"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-stone-400 transition-transform flex-shrink-0 ml-2",
            open && "rotate-180"
          )}
        />
      </button>

      <DropdownPortal
        anchorRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
        estimatedHeight={224}
        className="bg-white border border-stone-100 shadow-2xl max-h-56 overflow-y-auto animate-in fade-in duration-150"
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className={cn(
              "w-full text-left px-4 py-2.5 text-xs hover:bg-stone-50 transition-colors",
              value === opt.value ? "bg-stone-100 font-bold text-black" : "text-stone-600"
            )}
          >
            {opt.label}
          </button>
        ))}
      </DropdownPortal>
    </div>
  );
}
