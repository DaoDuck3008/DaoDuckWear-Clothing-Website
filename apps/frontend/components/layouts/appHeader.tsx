"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  ChevronDown,
  Search,
  Heart,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { logout } from "@/apis/auth.api";
import { toast } from "react-toastify";
import CartSidebar from "../cart/CartSidebar";
import FavoriteSidebar from "../favorites/FavoriteSidebar";
import { useCartStore } from "@/stores/cart.store";
import { useFavoriteStore } from "@/stores/favorite.store";
import { categoryApi } from "@/apis/category.api";
import { cn } from "@/utils/cn";
import { handleApiError } from "@/utils/error.util";
import UserAvatar from "@/components/ui/UserAvatar";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated, clearAuth } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems);
  const totalFavorites = useFavoriteStore((state) => state.totalItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const resetFavorites = useFavoriteStore((state) => state.resetFavorites);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoriteOpen, setIsFavoriteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Only fetch categories ONCE on mount
  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getCategories();
        setCategories(data);
      } catch (error) {
        handleApiError(error, "Lấy danh mục thất bại vui lòng thử lại");
      }
    };
    fetchCategories();

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

  // 2. Handle scroll logic separately to avoid re-fetching
  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 150) {
          setIsVisible(false); // Scrolling down
        } else {
          setIsVisible(true); // Scrolling up
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      handleApiError(error, "Đăng xuất thất bại vui lòng thử lại");
    } finally {
      clearAuth();
      clearCart();
      resetFavorites();
      setDropdownOpen(false);
      toast.success("Đã đăng xuất thành công!");
      router.push("/");
    }
  };

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    {
      name: "Sản phẩm",
      href: "/products",
      hasDropdown: true,
      dropdownType: "all",
    },
    { name: "New Arrivals", href: "/products?sort=newest" },
    {
      name: "Áo Nam",
      href:
        "/products/category/" +
        (categories.find((c) => c.name === "Áo")?.slug || ""),
      hasDropdown: true,
      parentName: "Áo",
    },
    {
      name: "Quần Nam",
      href:
        "/products/category/" +
        (categories.find((c) => c.name === "Quần")?.slug || ""),
      hasDropdown: true,
      parentName: "Quần",
    },
    {
      name: "Phụ kiện",
      href:
        "/products/category/" +
        (categories.find((c) => c.name === "Phụ kiện")?.slug || ""),
      hasDropdown: true,
      parentName: "Phụ kiện",
    },
    { name: "Về chúng tôi", href: "/about" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 w-full z-50 bg-white border-b border-stone-100 font-outfit overflow-visible transition-transform duration-500 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-4 lg:py-6 overflow-visible">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            {/* Social Icons */}
            <div className="hidden lg:flex items-center gap-6 flex-1">
              <a className="hover:opacity-60 transition-opacity" href="#">
                <img
                  src="/assets/FacebookIcon.png"
                  alt="Facebook"
                  className="w-4 h-4 object-contain grayscale"
                />
              </a>
              <a className="hover:opacity-60 transition-opacity" href="#">
                <img
                  src="/assets/InstagramIcon.png"
                  alt="Instagram"
                  className="w-4 h-4 object-contain grayscale"
                />
              </a>
              <a className="hover:opacity-60 transition-opacity" href="#">
                <img
                  src="/assets/YoutubeIcon.png"
                  alt="Youtube"
                  className="w-4 h-4 object-contain grayscale"
                />
              </a>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link
                className="font-cormorant text-3xl lg:text-4xl font-bold tracking-tighter text-black uppercase italic"
                href="/"
              >
                DaoDuck Wear
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end">
              <div className="hidden md:flex items-center border-b border-black/10 pb-1">
                <Search className="w-4 h-4 text-black mr-2" />
                <input
                  className="bg-transparent border-none p-0 text-[10px] focus:ring-0 placeholder:text-stone-400 w-24 lg:w-32 font-bold uppercase tracking-widest"
                  placeholder="Tìm kiếm..."
                  type="text"
                />
              </div>

              {/* Auth section */}
              {!hydrated ? (
                <div className="h-6 w-6 animate-pulse rounded-full bg-stone-100" />
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="hover:opacity-60 transition-opacity flex items-center gap-2"
                  >
                    <span className="hidden md:inline text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                      {user.username}
                    </span>
                    <UserAvatar
                      avatar={user.avatar}
                      username={user.username}
                      className="w-6 h-6 text-[10px]"
                      fallbackIconClassName="w-4 h-4"
                    />
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform",
                        dropdownOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-100 shadow-xl z-50 p-2">
                      <div className="px-3 py-3 border-b border-stone-100 mb-1 flex items-center gap-3">
                        <UserAvatar
                          avatar={user.avatar}
                          username={user.username}
                          className="w-10 h-10 flex-shrink-0 text-sm"
                          fallbackIconClassName="w-5 h-5"
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">
                            Thành viên
                          </p>
                          <p className="text-xs font-bold truncate text-black uppercase tracking-tight">
                            {user.username}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors"
                      >
                        Hồ sơ
                      </Link>
                      {(user.role === "ADMIN" ||
                        user.role === "STAFF" ||
                        user.role === "MANAGER") && (
                        <Link
                          href="/admin"
                          className="block text-blue-600 px-3 py-2 text-[11px] uppercase tracking-wider hover:bg-stone-50 transition-colors"
                        >
                          Trang quản trị
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-[11px] uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hover:opacity-60 transition-opacity"
                >
                  <LogIn className="w-6 h-6 text-black" />
                </Link>
              )}

              <button
                onClick={() => setIsFavoriteOpen(true)}
                className="hover:opacity-60 transition-opacity hidden sm:block relative group"
              >
                <Heart className="w-6 h-6 text-black" />
                {mounted && totalFavorites() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">
                    {totalFavorites()}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    toast.info("Vui lòng đăng nhập để xem giỏ hàng");
                    router.push("/login");
                  } else {
                    setIsCartOpen(true);
                  }
                }}
                className="hover:opacity-60 transition-opacity relative group"
              >
                <ShoppingBag className="w-6 h-6 text-black" />
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links Centered */}
          <nav className="flex justify-center gap-6 lg:gap-10 items-center mt-4 lg:mt-8 overflow-x-auto lg:overflow-visible no-scrollbar pb-2">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={cn(
                    "font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.25em] transition-all whitespace-nowrap pb-1 border-b-2 border-transparent hover:border-black",
                    pathname === link.href
                      ? "text-black border-black"
                      : "text-stone-500 hover:text-black",
                  )}
                >
                  {link.name}
                </Link>

                {link.hasDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-white border border-stone-100 shadow-2xl p-8 min-w-[240px] grid grid-cols-1 gap-6">
                      {/* Case 1: Dropdown for "Sản phẩm" */}
                      {link.dropdownType === "all" &&
                        categories.map((parent) => (
                          <div key={parent.id} className="space-y-3">
                            <Link
                              href={`/products/category/${parent.slug}`}
                              className="text-[11px] font-black uppercase tracking-widest text-black hover:text-stone-500 transition-colors"
                            >
                              {parent.name}
                            </Link>
                            {parent.children && parent.children.length > 0 && (
                              <div className="flex flex-col gap-2 pl-3 border-l border-stone-100">
                                {parent.children.map((child: any) => (
                                  <Link
                                    key={child.id}
                                    href={`/products/category/${child.slug}`}
                                    className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-black transition-colors font-medium"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Case 2: Dropdown for specific category */}
                      {link.parentName && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            {categories
                              .find((cat) => cat.name === link.parentName)
                              ?.children?.map((child: any) => (
                                <Link
                                  key={child.id}
                                  href={`/products/category/${child.slug}`}
                                  className="text-[12px] font-bold uppercase tracking-widest text-stone-500 hover:text-black hover:translate-x-1 transition-all"
                                >
                                  {child.name}
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FavoriteSidebar
        isOpen={isFavoriteOpen}
        onClose={() => setIsFavoriteOpen(false)}
      />
    </>
  );
}
