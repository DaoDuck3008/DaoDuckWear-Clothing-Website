"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// useLayoutEffect cảnh báo khi chạy SSR — dùng useEffect ở server để tránh warning.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface DropdownPortalProps {
  /** Phần tử neo (thường là nút trigger) để định vị menu */
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Class cho khung menu (nền, border, shadow, max-height...) */
  className?: string;
  /** Khoảng cách giữa anchor và menu (px) */
  gap?: number;
  /** Chiều cao ước lượng của menu để quyết định lật lên/xuống (px) */
  estimatedHeight?: number;
  /** Khớp chiều rộng menu với anchor (mặc định true) */
  matchWidth?: boolean;
  /** z-index của menu — mặc định 9000 (đè modal thường z-50, dưới loading/alert) */
  zIndex?: number;
}

interface Coords {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  placement: "up" | "down";
}

export function DropdownPortal({
  anchorRef,
  open,
  onClose,
  children,
  className = "",
  gap = 4,
  estimatedHeight = 260,
  matchWidth = true,
  zIndex = 9000,
}: DropdownPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    // Lật lên khi bên dưới không đủ chỗ mà bên trên rộng rãi hơn.
    const dropUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    setCoords({
      left: r.left,
      width: r.width,
      placement: dropUp ? "up" : "down",
      ...(dropUp
        ? { bottom: window.innerHeight - r.top + gap }
        : { top: r.bottom + gap }),
    });
  }, [anchorRef, estimatedHeight, gap]);

  useIsoLayoutEffect(() => {
    if (!open) return;
    update();
    // capture: true để bắt scroll ở mọi container cha, không chỉ window.
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, update]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, anchorRef]);

  if (!mounted || !open || !coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      data-placement={coords.placement}
      style={{
        position: "fixed",
        left: coords.left,
        top: coords.top,
        bottom: coords.bottom,
        width: matchWidth ? coords.width : undefined,
        zIndex,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body,
  );
}
