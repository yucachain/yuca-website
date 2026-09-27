import {
  Conversation,
  Message,
  StartConversationPayload,
  SendMessagePayload,
  GenericResponse,
} from '@/app/types/messages';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/backend-api/api/v1';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const MessagesApi = {
  /**
   * GET /api/v1/messages/conversations
   * Fetch all active conversations for the user
   */
  getConversations: (): Promise<Conversation[]> => {
    return fetcher<Conversation[]>('/messages/conversations', {
      method: 'GET',
    });
  },

  /**
   * POST /api/v1/messages/conversations
   * Start a new conversation with a user
   */
  startConversation: (payload: StartConversationPayload): Promise<Conversation> => {
    return fetcher<Conversation>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /api/v1/messages/conversations/{id}
   * Get a single conversation with its message history
   */
  getConversationById: (id: string): Promise<Conversation> => {
    return fetcher<Conversation>(`/messages/conversations/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  },

  /**
   * POST /api/v1/messages/conversations/{id}
   * Send a new message within an existing conversation
   */
  sendMessage: (id: string, payload: SendMessagePayload): Promise<Message> => {
    return fetcher<Message>(`/messages/conversations/${encodeURIComponent(id)}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * PUT /api/v1/messages/conversations/{id}/read
   * Mark all messages in a conversation as read
   */
  markAsRead: (id: string): Promise<GenericResponse> => {
    return fetcher<GenericResponse>(
      `/messages/conversations/${encodeURIComponent(id)}/read`,
      {
        method: 'PUT',
      }
    );
  },
};