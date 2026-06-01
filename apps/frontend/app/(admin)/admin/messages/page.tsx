"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageSquare, User as UserIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import RoleGuard from "@/components/guards/roleGuard";
import { useChatStore } from "@/stores/chat.store";
import { ChatConversation, ChatConversationCustomer } from "@/types/chat";

function getCustomer(
  conversation: ChatConversation,
): ChatConversationCustomer | null {
  if (typeof conversation.customerId === "object") {
    return conversation.customerId;
  }
  return null;
}

function MessagesContent() {
  const {
    conversations,
    activeConversationId,
    messages,
    loadingMessages,
    initSocket,
    fetchConversations,
    openConversation,
    sendMessage,
  } = useChatStore();

  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSocket();
    fetchConversations();
  }, [initSocket, fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeCustomer = useMemo(() => {
    const conv = conversations.find((c) => c.id === activeConversationId);
    return conv ? getCustomer(conv) : null;
  }, [conversations, activeConversationId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] border border-stone-200 bg-white overflow-hidden">
      {/* Danh sách hội thoại */}
      <aside className="w-72 border-r border-stone-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-stone-100">
          <h1 className="font-cormorant text-xl font-bold uppercase tracking-wide">
            Tin nhắn
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mt-0.5">
            Hội thoại của chi nhánh
          </p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-xs text-stone-400">
              Chưa có hội thoại nào.
            </p>
          ) : (
            conversations.map((conv) => {
              const customer = getCustomer(conv);
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-stone-50 transition-colors",
                    isActive ? "bg-stone-100" : "hover:bg-stone-50",
                  )}
                >
                  <span className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {customer?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={customer.avatar}
                        alt={customer.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-stone-500" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold truncate">
                        {customer?.username ?? "Khách"}
                      </span>
                      {conv.shopUnread > 0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-editorial-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.shopUnread}
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-stone-400 truncate">
                      {conv.lastMessage ?? "Bắt đầu trò chuyện"}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Khung hội thoại */}
      <section className="flex-1 flex flex-col min-w-0">
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-300">
            <MessageSquare className="w-14 h-14" />
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400">
              Chọn một hội thoại để trả lời
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-stone-500" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {activeCustomer?.username ?? "Khách"}
                </p>
                {activeCustomer?.email && (
                  <p className="text-[11px] text-stone-400 truncate">
                    {activeCustomer.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 bg-stone-50">
              {loadingMessages ? (
                <p className="text-center text-xs text-stone-400 py-6">
                  Đang tải tin nhắn...
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.senderType === "shop"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] px-4 py-2 text-sm leading-relaxed rounded-2xl",
                        m.senderType === "shop"
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
                placeholder="Nhập tin nhắn trả lời..."
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
      </section>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <RoleGuard allowedRoles={["MANAGER", "RECEPTIONIST"]}>
      <MessagesContent />
    </RoleGuard>
  );
}
