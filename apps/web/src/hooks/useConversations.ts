import { useState, useEffect } from 'react';
import { getMyConversations, ConversationResponse } from '../services/messageService';

interface UseConversationsParams {
  page?: number;
  limit?: number;
  context?: string;
  status?: string;
}

export const useConversations = (params: UseConversationsParams = {}) => {
  const [data, setData] = useState<ConversationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyConversations(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [params.page, params.limit, params.context, params.status]);

  return {
    conversations: data?.conversations || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchConversations,
  };
}; 