import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface ConversationContext {
  type: 'adoption_request' | 'offer' | 'admin_message' | 'broadcast';
  status?: string;
  companyName?: string;
  offerTitle?: string;
  initialMessage?: string;
  target?: 'ALL' | 'STUDENTS' | 'COMPANIES';
}

export interface Conversation {
  id: string;
  topic?: string;
  isReadOnly: boolean;
  isBroadcast: boolean;
  broadcastTarget?: 'ALL' | 'STUDENTS' | 'COMPANIES';
  context?: string;
  status?: string;
  expiresAt?: string;
  participants: any[];
  lastMessage?: any;
  updatedAt: string;
  createdAt: string;
  contextDetails?: ConversationContext;
}

export interface ConversationResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ConversationDetails {
  id: string;
  topic?: string;
  isReadOnly: boolean;
  isBroadcast: boolean;
  broadcastTarget?: 'ALL' | 'STUDENTS' | 'COMPANIES';
  context?: string;
  status?: string;
  expiresAt?: string;
  participants: any[];
  adoptionRequestStatus?: string;
  applicationStatus?: string;
  contextDetails?: ConversationContext;
}

export interface MessagesResponse {
  messages: Message[];
  conversation: ConversationDetails;
}

export const getMyConversations = async (params: {
  page?: number;
  limit?: number;
  context?: string;
  status?: string;
} = {}): Promise<ConversationResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.context) searchParams.append('context', params.context);
  if (params.status) searchParams.append('status', params.status);

  const { data } = await apiClient.get('/messages/conversations', { params: searchParams });
  return data;
};

export const getMessagesForConversation = async (conversationId: string): Promise<MessagesResponse> => {
  const { data } = await apiClient.get(`/messages/conversations/${conversationId}`);
  return data;
};

export const createMessageInConversation = async (conversationId: string, content: string): Promise<Message> => {
  const { data } = await apiClient.post(`/messages/conversations/${conversationId}`, { content });
  return data;
}; 