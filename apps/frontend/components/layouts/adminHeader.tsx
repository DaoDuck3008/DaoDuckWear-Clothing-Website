"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { logout } from "@/apis/auth.api";
import { toast } from "react-toastify";
import { ROLE_MAP, RoleKey } from "@/constants/role";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { user, hydrated, clearAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout api errors
    } finally {
      clearAuth();
      setDropdownOpen(false);
      toast.success("Đã đăng xuất thành công!");
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full z-30 bg-white border-b border-stone-100 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-stone-500 hover:text-black hover:bg-stone-50 transition-colors flex-shrink-0"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo — mobile only (desktop logo is in sidebar) */}
        <Link
          href="/admin"
          className="md:hidden font-cormorant text-lg font-bold tracking-tighter text-black"
        >
          DAODUCK WEAR
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: user dropdown */}
        {!hydrated ? (
          <div className="h-6 w-6 animate-pulse rounded-full bg-stone-100" />
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hover:opacity-70 transition-opacity flex items-center gap-2 border border-stone-200 hover:border-black rounded-full px-3 py-1.5"
            >
              <div className="hidden sm:flex flex-col items-end leading-none">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black flex items-center gap-1">
                  <span className="text-[9px] font-black bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded uppercase tracking-tight">
                    {ROLE_MAP[user.role as RoleKey] || user.role}
                  </span>
                  {user.username}
                </span>
                {user.shop && (
                  <span className="text-[8px] font-medium text-stone-400 uppercase tracking-widest mt-0.5">
                    {user.shop.name}
                  </span>
                )}
              </div>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-black" />
              )}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white border border-stone-100 shadow-xl z-50 py-2">
                <div className="px-4 py-2.5 border-b border-stone-100 mb-1">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">
                    {ROLE_MAP[user.role as RoleKey] || "Thành viên"}
                  </p>
                  <p className="text-xs font-bold truncate text-black uppercase tracking-tight">
                    {user.username}
                  </p>
                  {user.email && (
                    <p className="text-[10px] text-stone-500 truncate mt-0.5 normal-case tracking-normal font-medium">
                      {user.email}
                    </p>
                  )}
                  {user.shop && (
                    <div className="mt-2 pt-2 border-t border-stone-50">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-0.5">
                        Chi nhánh
                      </p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">
                        {user.shop.name}
                      </p>
                    </div>
                  )}
                </div>
                <Link
                  href="/admin/profile"
                  className="block px-4 py-2 text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  Hồ sơ
                </Link>
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  Trang quản trị
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[11px] uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
