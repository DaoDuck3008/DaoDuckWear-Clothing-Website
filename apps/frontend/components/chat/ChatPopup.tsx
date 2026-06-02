"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, ChevronLeft, Send, Store } from "lucide-react";
import { cn } from "@/utils/cn";
import ModalPortal from "../ui/modalPortal";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import { isShopRole, isChatStaffRole } from "@/constants/role";
import { shopApi } from "@/apis/shop.api";
import Link from "next/link";

interface ShopOption {
  id: string;
  name: string;
  cityName?: string;
}

export default function ChatPopup() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.access_token);
  const hydrated = useAuthStore((s) => s.hydrated);

  const {
    isOpen,
    setOpen,
    initSocket,
    fetchConversations,
    selectShop,
    sendMessage,
    messages,
    activeConversationId,
    loadingMessages,
    unreadTotal,
  } = useChatStore();

  const [shops, setShops] = useState<ShopOption[]>([]);
  const [activeShop, setActiveShop] = useState<ShopOption | null>(null);
  const [draft, setDraft] = useState("");
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const isCustomer = !!user && !isShopRole(user.role);

  // Khởi tạo socket + tải hội thoại (để hiện badge chưa đọc) khi là khách đã đăng nhập
  // Phụ thuộc accessToken: chỉ kết nối khi token đã sẵn sàng
  useEffect(() => {
    if (!isCustomer || !accessToken) return;
    initSocket();
    fetchConversations();
  }, [isCustomer, accessToken, initSocket, fetchConversations]);

  // Hiệu ứng slide-in/out
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimate(true), 10);
      return () => clearTimeout(timer);
    }
    setIsAnimate(false);
    const timer = setTimeout(() => setShouldRender(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Tải danh sách cửa hàng khi mở popup lần đầu
  useEffect(() => {
    if (!isOpen || !isCustomer || shops.length > 0) return;
    shopApi
      .getShops()
      .then((data: ShopOption[]) => setShops(data))
      .catch(() => undefined);
  }, [isOpen, isCustomer, shops.length]);

  // Cuộn xuống cuối khi có tin mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalUnread = unreadTotal();

  const handleSelectShop = async (shop: ShopOption) => {
    setActiveShop(shop);
    await selectShop(shop.id);
  };

  const handleBack = () => {
    setActiveShop(null);
    useChatStore.setState({ activeConversationId: null, messages: [] });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  const headerTitle = useMemo(() => {
    if (activeConversationId && activeShop) return activeShop.name;
    return "Tin nhắn";
  }, [activeConversationId, activeShop]);

  if (!hydrated || isShopRole(user?.role)) return null;

  return (
    <>
      {/* Nút nổi */}
      <button
        onClick={() => setOpen(!isOpen)}
        aria-label="Mở chat với cửa hàng"
        className="fixed bottom-24 right-6 z-[90] w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-2xl hover:bg-stone-800 transition-all active:scale-95"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-editorial-accent text-white text-[10px] font-bold flex items-center justify-center">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {shouldRender && (
        <ModalPortal>
          <div
            className={cn(
              "fixed bottom-44 right-6 z-[95] w-[calc(100vw-3rem)] max-w-[340px] h-[55vh] max-h-[440px]",
              "bg-white shadow-2xl border border-stone-200 rounded-2xl flex flex-col overflow-hidden",
              "transition-all duration-300 ease-out origin-bottom-right",
              isAnimate
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95",
            )}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-black text-white flex items-center gap-3">
              {activeConversationId && (
                <button
                  onClick={handleBack}
                  className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Quay lại"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-cormorant text-lg font-bold tracking-wide truncate">
                  {headerTitle}
                </h2>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                  DaoDuckWear · Hỗ trợ khách hàng
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung */}
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <MessageCircle className="w-12 h-12 text-stone-300" />
                <p className="text-sm text-stone-600">
                  Vui lòng đăng nhập để trò chuyện với cửa hàng.
                </p>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-stone-800 transition-all"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : !activeConversationId ? (
              // Danh sách cửa hàng để bắt đầu/tiếp tục chat
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <p className="px-5 pt-5 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                  Chọn cửa hàng để nhắn tin
                </p>
                <div className="px-3 pb-4 space-y-1">
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => handleSelectShop(shop)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg transition-colors text-left"
                    >
                      <span className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-stone-500" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold truncate">
                          {shop.name}
                        </span>
                        {shop.cityName && (
                          <span className="block text-[11px] text-stone-400 truncate">
                            {shop.cityName}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                  {shops.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-stone-400">
                      Đang tải danh sách cửa hàng...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Khung hội thoại
              <>
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-stone-50">
                  {loadingMessages ? (
                    <p className="text-center text-xs text-stone-400 py-6">
                      Đang tải tin nhắn...
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-xs text-stone-400 py-6">
                      Hãy gửi lời chào tới cửa hàng
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "flex",
                          m.senderType === "customer"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2 text-sm leading-relaxed rounded-2xl",
                            m.senderType === "customer"
                              ? "bg-black text-white rounded-br-sm"
                              : "bg-white border border-stone-200 text-stone-800 rounded-bl-sm",
                          )}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-stone-100 flex items-center gap-2"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-stone-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/20"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    aria-label="Gửi"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </ModalPortal>
      )}
    </>
  );
}
