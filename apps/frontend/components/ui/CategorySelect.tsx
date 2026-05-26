"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type CategoryNode = {
  id: string;
  name: string;
  children: CategoryNode[];
};

interface CategorySelectProps {
  value: string;
  onChange: (id: string, name: string) => void;
  categories: CategoryNode[];
}

export function CategorySelect({
  value,
  onChange,
  categories,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  // Tự động tìm label khi value hoặc categories thay đổi
  useEffect(() => {
    if (value && categories.length > 0) {
      const findLabel = (nodes: CategoryNode[], parent?: string): string | null => {
        for (const node of nodes) {
          if (node.id === value) return parent ? `${parent} › ${node.name}` : node.name;
          if (node.children?.length > 0) {
            const label = findLabel(node.children, node.name);
            if (label) return label;
          }
        }
        return null;
      };
      setSelectedLabel(findLabel(categories) || "");
    } else if (!value) {
      setSelectedLabel("");
    }
  }, [value, categories]);

  const handleSelect = (cat: CategoryNode, parentName?: string) => {
    const label = parentName ? `${parentName} › ${cat.name}` : cat.name;
    setSelectedLabel(label);
    onChange(cat.id, cat.name);
    setOpen(false);
  };

  const renderTree = (cats: CategoryNode[], depth = 0, parentName?: string) =>
    cats.map((cat) => (
      <div key={cat.id}>
        <button
          type="button"
          onClick={() => handleSelect(cat, parentName)}
          className={`w-full text-left py-2 text-xs hover:bg-stone-50 transition-colors flex items-center gap-1.5
            ${depth === 0 ? "px-3 font-bold text-stone-700" : "px-6 text-stone-500"}
            ${value === cat.id ? "!text-black !bg-stone-100 font-bold" : ""}
          `}
        >
          {depth > 0 && <span className="text-stone-300 text-[10px]">└</span>}
          {cat.name}
          {cat.children.length > 0 && (
            <span className="ml-auto text-[9px] text-stone-300 uppercase tracking-wider">
              ({cat.children.length})
            </span>
          )}
        </button>
        {cat.children.length > 0 &&
          renderTree(cat.children, depth + 1, cat.name)}
      </div>
    ));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-transparent border-b border-stone-200 hover:border-black py-2.5 text-sm transition-colors text-left"
      >
        <span
          className={
            selectedLabel
              ? "text-black font-medium text-sm"
              : "text-stone-400 text-sm"
          }
        >
          {selectedLabel || "Chọn danh mục..."}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform flex-shrink-0 ml-2 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-stone-100 shadow-2xl mt-1 max-h-56 overflow-y-auto">
            {renderTree(categories)}
          </div>
        </>
      )}
    </div>
  );
}
