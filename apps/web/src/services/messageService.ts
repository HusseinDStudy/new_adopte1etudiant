import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;// || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    role: 'STUDENT' | 'COMPANY';
    email: string;
  };
}

export interface Conversation {
    id: string;
    topic: string; 
    lastMessage: string;
    updatedAt: string;
}

export const getMyConversations = async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
};

export interface ConversationWithMessages {
  messages: Message[];
  adoptionRequestStatus: string | null;
}

export const getMessagesForConversation = async (conversationId: string): Promise<ConversationWithMessages> => {
  const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
  return response.data;
};

export const createMessageInConversation = async (conversationId: string, content: string): Promise<Message> => {
  const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, { content });
  return response.data;
}; 