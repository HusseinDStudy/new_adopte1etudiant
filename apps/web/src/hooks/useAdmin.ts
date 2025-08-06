import { useState, useEffect } from 'react';
import {
  getAdminUsers,
  getAdminOffers,
  getAdminStats,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  deleteOffer,
  updateOfferStatus,
  sendAdminMessage,
  sendBroadcastMessage,
  getAdminConversations,
  AdminUser,
  AdminOffer,
  AdminStats,
  PaginatedResponse
} from '../services/adminService';

// Hook for admin users management
export const useAdminUsers = (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
} = {}) => {
  const [data, setData] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminUsers(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    params.page,
    params.limit,
    params.search,
    params.role,
    params.isActive,
  ]);

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchUsers,
  };
};

// Hook for admin offers management
export const useAdminOffers = (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  companyId?: string;
} = {}) => {
  const [data, setData] = useState<PaginatedResponse<AdminOffer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching admin offers with params:', params);
      const result = await getAdminOffers(params);
      console.log('📥 Admin offers result:', result);
      console.log('📊 Pagination data:', result?.pagination);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      console.error('Error fetching admin offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [
    params.page,
    params.limit,
    params.search,
    params.isActive,
    params.companyId,
  ]);

  return {
    offers: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchOffers,
  };
};

// Hook for admin statistics
export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminStats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for admin mutations (users)
export const useAdminUserMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (userId: string, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await updateUserStatus(userId, isActive);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      await updateUserRole(userId, role);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user role';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserById = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser(userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    updateRole,
    deleteUser: deleteUserById,
    loading,
    error
  };
};

// Hook for admin offer mutations
export const useAdminOfferMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (offerId: string, isActive: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await updateOfferStatus(offerId, isActive);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update offer status';
      setError(errorMessage);
      console.error('Error updating offer status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOfferById = async (offerId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteOffer(offerId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete offer';
      setError(errorMessage);
      console.error('Error deleting offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    deleteOffer: deleteOfferById,
    loading,
    error,
  };
};

// Hook for admin messaging
export const useAdminMessaging = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (data: {
    recipientId: string;
    subject: string;
    content: string;
    isReadOnly?: boolean;
  }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await sendAdminMessage(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending admin message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async (data: {
    targetRole?: 'STUDENT' | 'COMPANY' | 'ALL';
    subject: string;
    content: string;
  }): Promise<{ conversationId: string; sentTo: number }> => {
    try {
      setLoading(true);
      setError(null);
      const result = await sendBroadcastMessage(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send broadcast message';
      setError(errorMessage);
      console.error('Error sending broadcast message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    sendBroadcast,
    loading,
    error,
  };
};

// Hook for admin conversations
export const useAdminConversations = (params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminConversations(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      console.error('Error fetching admin conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [params.page, params.limit, params.search]);

  return {
    conversations: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchConversations,
  };
}; 