"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  Ticket,
  LogOut,
  Home,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { logout } from "@/apis/auth.api";
import { toast } from "react-toastify";

const MENU_ITEMS = [
  { label: "Tài khoản", href: "/profile", icon: User },
  { label: "Đơn hàng", href: "/profile/orders", icon: Package },
  { label: "Yêu thích", href: "/profile/favorites", icon: Heart },
  { label: "Voucher của tôi", href: "/profile/vouchers", icon: Ticket },
];

const ROLE_LABEL: Record<string, string> = {
  USER: "Thành viên",
  ADMIN: "Quản trị viên",
  SELLER: "Người bán",
};

export function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { clearAuth, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      toast.success("Đăng xuất thành công");
      router.push("/");
    }
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-white border-r border-stone-100 transition-all duration-300 ease-in-out z-[100] shrink-0",
        isCollapsed ? "w-[72px]" : "w-64 lg:w-72",
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-stone-100 shrink-0">
        {!isCollapsed ? (
          <Link
            href="/"
            className="font-cormorant text-xl font-bold tracking-tighter uppercase italic truncate"
          >
            DAODUCK WEAR
          </Link>
        ) : (
          <Link
            href="/"
            className="mx-auto font-cormorant text-xl font-bold italic"
          >
            D
          </Link>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-full hover:bg-stone-50 transition-colors text-stone-400 hover:text-black shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile summary */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-stone-50 transition-all shrink-0",
          isCollapsed ? "justify-center py-4 px-2" : "px-5 py-4",
        )}
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-stone-900 text-white text-base font-black shadow-md overflow-hidden shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            user?.username?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-black uppercase tracking-widest truncate">
              {user?.username || "Người dùng"}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[8px] font-black uppercase tracking-widest rounded-full">
              {ROLE_LABEL[user?.role ?? ""] ?? "Thành viên"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto no-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/profile" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group relative",
                isActive
                  ? "bg-black text-white shadow-md shadow-stone-200"
                  : "text-stone-400 hover:text-black hover:bg-stone-50",
                isCollapsed && "justify-center",
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-transform",
                  isActive ? "scale-110" : "group-hover:scale-110",
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] truncate flex-1">
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="w-3 h-3 text-white shrink-0" />}
                </>
              )}

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="fixed left-[76px] hidden group-hover:block bg-black text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 whitespace-nowrap shadow-xl z-50 rounded-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-stone-50 space-y-0.5 shrink-0">
        <Link
          href="/"
          title={isCollapsed ? "Về trang chủ" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-stone-500 hover:text-black transition-all group rounded-2xl hover:bg-stone-50",
            isCollapsed && "justify-center",
          )}
        >
          <Home className="w-[18px] h-[18px] shrink-0 group-hover:scale-110 transition-transform" />
          {!isCollapsed && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em]">
                Về trang chủ
              </p>
              <p className="text-[8px] uppercase tracking-widest text-stone-300 font-bold mt-0.5">
                Quay lại cửa hàng
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="fixed left-[76px] hidden group-hover:block bg-black text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 whitespace-nowrap shadow-xl z-50 rounded-lg">
              Về trang chủ
            </div>
          )}
        </Link>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Đăng xuất" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 text-rose-500 hover:bg-rose-50 transition-all group rounded-2xl",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:scale-110 transition-transform" />
          {!isCollapsed && (
            <span className="text-[11px] font-black uppercase tracking-[0.18em]">
              Đăng xuất
            </span>
          )}
          {isCollapsed && (
            <div className="fixed left-[76px] hidden group-hover:block bg-black text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 whitespace-nowrap shadow-xl z-50 rounded-lg">
              Đăng xuất
            </div>
          )}
        </button>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center py-2 text-stone-300 hover:text-black transition-colors rounded-2xl hover:bg-stone-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
