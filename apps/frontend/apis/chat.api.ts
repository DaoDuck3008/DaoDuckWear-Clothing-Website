import { api } from "./api";
import { ChatConversation, ChatMessage } from "@/types/chat";

export const chatApi = {
  // Khách mở/tiếp tục hội thoại với một cửa hàng
  getOrCreateConversation: async (shopId: string): Promise<ChatConversation> => {
    const res = await api.post("/chat/conversations", { shopId });
    return res.data;
  },

  // Danh sách hội thoại (khách: của mình; nhân viên: của chi nhánh)
  getConversations: async (): Promise<ChatConversation[]> => {
    const res = await api.get("/chat/conversations");
    return res.data;
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`);
    return res.data;
  },
};
