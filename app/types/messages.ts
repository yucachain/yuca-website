export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  participantId?: string;
  participantName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  messages?: Message[];
  [key: string]: unknown;
}

export interface StartConversationPayload {
  recipientId: string;
  initialMessage: string;
  [key: string]: unknown;
}

export interface SendMessagePayload {
  content: string;
  [key: string]: unknown;
}

export interface GenericResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}