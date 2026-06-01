export type ChatSenderType = "customer" | "shop";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: ChatSenderType;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// shopId được populate ở danh sách của khách; customerId được populate ở inbox cửa hàng
export interface ChatConversationShop {
  id: string;
  name: string;
  cityName?: string;
}

export interface ChatConversationCustomer {
  id: string;
  username: string;
  avatar?: string | null;
  email?: string;
}

export interface ChatConversation {
  id: string;
  customerId: string | ChatConversationCustomer;
  shopId: string | ChatConversationShop;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  customerUnread: number;
  shopUnread: number;
  createdAt?: string;
  updatedAt?: string;
}
