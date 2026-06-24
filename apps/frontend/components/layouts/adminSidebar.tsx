"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Warehouse,
  ImagePlay,
  Ticket,
  ScrollText,
  MessageSquare,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";

type AdminRole = "ADMIN" | "MANAGER" | "STAFF" | "RECEPTIONIST";

interface MenuItem {
  title: string;
  icon: typeof LayoutDashboard;
  href: string;
  subItems?: { title: string; href: string }[];
  allowedRoles?: AdminRole[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Quản lý sản phẩm",
    icon: ShoppingBag,
    href: "/admin/products",
    subItems: [
      { title: "Danh sách sản phẩm", href: "/admin/products" },
      { title: "Thêm sản phẩm mới", href: "/admin/products/create-product" },
    ],
  },
  {
    title: "Quản lý tồn kho",
    icon: Warehouse,
    href: "/admin/inventory",
    subItems: [
      { title: "Xem tồn kho", href: "/admin/inventory" },
      { title: "Lịch sử nhập kho", href: "/admin/inventory/history" },
    ],
  },
  {
    title: "Quản lý danh mục",
    icon: Layers,
    href: "/admin/categories",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Quản lý Banner",
    icon: ImagePlay,
    href: "/admin/banners",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Quản lý đơn hàng",
    icon: ClipboardList,
    href: "/admin/orders",
  },
  {
    title: "Tin nhắn",
    icon: MessageSquare,
    href: "/admin/messages",
    allowedRoles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Quản lý Voucher",
    icon: Ticket,
    href: "/admin/vouchers",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Quản lý khách hàng",
    icon: Users,
    href: "/admin/customers",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Quản lý nhân viên",
    icon: Users,
    href: "/admin/staff",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Nhật ký hệ thống",
    icon: ScrollText,
    href: "/admin/audit-logs",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Cài đặt",
    icon: Settings,
    href: "/admin/settings",
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role) as AdminRole | undefined;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["Quản lý sản phẩm"]);

  const visibleItems = menuItems.filter(
    (item) => !item.allowedRoles || (role && item.allowedRoles.includes(role)),
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) setOpenMenus([]);
  };

  const toggleSubMenu = (title: string) => {
    if (isCollapsed) return;
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <aside
      className={cn(
        // Mobile: fixed overlay; Desktop: static sidebar
        "fixed inset-y-0 left-0 z-50 flex flex-col h-screen",
        "bg-stone-900 border-r border-stone-800",
        "transition-transform duration-300 ease-in-out",
        // Mobile: controlled by mobileOpen
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible, width controlled by collapse
        "md:relative md:translate-x-0 md:z-auto",
        isCollapsed ? "md:w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-stone-800 flex-shrink-0">
        {!isCollapsed && (
          <Link
            href="/admin"
            className="font-cormorant text-lg font-bold tracking-tighter text-white truncate"
            onClick={onMobileClose}
          >
            DAODUCK WEAR
          </Link>
        )}
        <div
          className={cn("flex items-center gap-1", isCollapsed && "mx-auto")}
        >
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Desktop collapse */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {visibleItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenus.includes(item.title);
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <div key={item.title}>
              <Link
                href={hasSubItems && !isCollapsed ? "#" : item.href}
                onClick={(e) => {
                  if (hasSubItems && !isCollapsed) {
                    e.preventDefault();
                    toggleSubMenu(item.title);
                  } else {
                    onMobileClose();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                  isActive && !hasSubItems
                    ? "bg-white/15 text-white"
                    : "text-stone-400 hover:text-white hover:bg-white/5",
                  isCollapsed && "justify-center",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive && !hasSubItems
                      ? "text-white"
                      : "group-hover:scale-110 transition-transform",
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] truncate flex-1">
                      {item.title}
                    </span>
                    {hasSubItems && (
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform duration-300",
                          isOpen && "rotate-180",
                        )}
                      />
                    )}
                  </>
                )}

                {/* Tooltip khi thu gọn */}
                {isCollapsed && (
                  <div className="fixed left-[4.5rem] hidden group-hover:flex items-center bg-stone-800 border border-stone-700 text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 whitespace-nowrap shadow-xl z-50 rounded-md">
                    {item.title}
                  </div>
                )}
              </Link>

              {/* Sub items */}
              {hasSubItems && isOpen && !isCollapsed && (
                <div className="ml-4 pl-3 border-l border-stone-700/60 flex flex-col space-y-0.5 py-1 mt-0.5">
                  {item.subItems!.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onMobileClose}
                        className={cn(
                          "py-2 px-2 rounded-md text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                          isSubActive
                            ? "text-white bg-white/10"
                            : "text-stone-500 hover:text-stone-300 hover:bg-white/5",
                        )}
                      >
                        {sub.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-stone-800 space-y-2 flex-shrink-0">
        <Link
          href="/"
          onClick={onMobileClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-all group",
            isCollapsed && "justify-center",
          )}
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] truncate">
                Về trang chủ
              </span>
              <span className="text-[9px] uppercase tracking-widest text-stone-600 truncate">
                Giao diện khách hàng
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="fixed left-[4.5rem] hidden group-hover:flex items-center bg-stone-800 border border-stone-700 text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 whitespace-nowrap shadow-xl z-50 rounded-md">
              Về trang chủ
            </div>
          )}
        </Link>

        {!isCollapsed ? (
          <div className="bg-stone-800/60 px-3 py-2 rounded-lg flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Version
            </p>
            <p className="text-[10px] font-bold text-stone-400 uppercase">
              v1.0.2-beta
            </p>
          </div>
        ) : (
          <div className="flex justify-center text-[9px] font-bold text-stone-600">
            v1.0
          </div>
        )}
      </div>
    </aside>
  );
}
