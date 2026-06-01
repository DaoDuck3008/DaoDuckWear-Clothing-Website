import { create } from "zustand";
import { chatApi } from "@/apis/chat.api";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";
import { isChatStaffRole } from "@/constants/role";
import { ChatConversation, ChatMessage, ChatSenderType } from "@/types/chat";

function mySide(): ChatSenderType {
  const role = useAuthStore.getState().user?.role;
  return isChatStaffRole(role) ? "shop" : "customer";
}

function unreadField(side: ChatSenderType): "shopUnread" | "customerUnread" {
  return side === "shop" ? "shopUnread" : "customerUnread";
}

interface ChatState {
  isOpen: boolean;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  listenersBound: boolean;

  setOpen: (open: boolean) => void;
  initSocket: () => void;
  teardown: () => void;
  fetchConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  selectShop: (shopId: string) => Promise<void>;
  sendMessage: (content: string) => void;
  appendMessage: (message: ChatMessage) => void;
  unreadTotal: () => number;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  conversations: [],
  activeConversationId: null,
  messages: [],
  loadingConversations: false,
  loadingMessages: false,
  listenersBound: false,

  setOpen: (open) => set({ isOpen: open }),

  initSocket: () => {
    const socket = connectSocket();
    if (get().listenersBound) return;

    socket.on("message:new", (message: ChatMessage) => {
      get().appendMessage(message);
    });

    set({ listenersBound: true });
  },

  teardown: () => {
    const socket = getSocket();
    socket.off("message:new");
    disconnectSocket();
    set({ listenersBound: false });
  },

  fetchConversations: async () => {
    set({ loadingConversations: true });
    try {
      const conversations = await chatApi.getConversations();
      set({ conversations });
    } catch (error) {
      console.error("Không tải được danh sách hội thoại:", error);
    } finally {
      set({ loadingConversations: false });
    }
  },

  openConversation: async (conversationId) => {
    set({ activeConversationId: conversationId, loadingMessages: true });
    try {
      const messages = await chatApi.getMessages(conversationId);
      set({ messages });

      // Tham gia room realtime
      getSocket().emit("conversation:join", { conversationId });

      // Đánh dấu đã đọc phía mình (server cũng đã reset)
      const field = unreadField(mySide());
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, [field]: 0 } : c,
        ),
      }));
    } catch (error) {
      console.error("Không tải được tin nhắn:", error);
    } finally {
      set({ loadingMessages: false });
    }
  },

  selectShop: async (shopId) => {
    try {
      const conversation = await chatApi.getOrCreateConversation(shopId);
      set((state) => {
        const exists = state.conversations.some((c) => c.id === conversation.id);
        return {
          conversations: exists
            ? state.conversations
            : [conversation, ...state.conversations],
        };
      });
      await get().openConversation(conversation.id);
    } catch (error) {
      console.error("Không mở được hội thoại:", error);
    }
  },

  sendMessage: (content) => {
    const { activeConversationId } = get();
    const trimmed = content.trim();
    if (!activeConversationId || !trimmed) return;
    // Đảm bảo đã kết nối (socket.io sẽ buffer rồi gửi khi connect xong)
    const socket = connectSocket();
    socket.emit("message:send", {
      conversationId: activeConversationId,
      content: trimmed,
    });
  },

  appendMessage: (message) => {
    const side = mySide();
    const field = unreadField(side);

    set((state) => {
      const isActive = message.conversationId === state.activeConversationId;
      const alreadyHas = state.messages.some((m) => m.id === message.id);
      const messages =
        isActive && !alreadyHas ? [...state.messages, message] : state.messages;

      const conversations = state.conversations.map((c) => {
        if (c.id !== message.conversationId) return c;
        const incoming = message.senderType !== side;
        const nextUnread = isActive
          ? 0
          : incoming
            ? c[field] + 1
            : c[field];
        return {
          ...c,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          [field]: nextUnread,
        };
      });

      return { messages, conversations };
    });

    // Hội thoại mới chưa có trong danh sách (vd: khách mới nhắn tới cửa hàng) → tải lại
    if (!get().conversations.some((c) => c.id === message.conversationId)) {
      void get().fetchConversations();
    }
  },

  unreadTotal: () => {
    const field = unreadField(mySide());
    return get().conversations.reduce((sum, c) => sum + (c[field] ?? 0), 0);
  },

  reset: () =>
    set({
      isOpen: false,
      conversations: [],
      activeConversationId: null,
      messages: [],
    }),
}));
