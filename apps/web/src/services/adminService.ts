import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Types for admin data
export interface AdminUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  profile?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    school?: string;
    degree?: string;
    sector?: string;
    size?: string;
  };
}

export interface AdminOffer {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    companyName: string;
    email: string;
  };
  _count: {
    applications: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalOffers: number;
  totalApplications: number;
  totalAdoptionRequests: number;
  totalBlogPosts: number;
  recentActivity: {
    newUsersToday: number;
    newOffersToday: number;
    newApplicationsToday: number;
  };
  usersByRole: Record<string, number>;
  offersByStatus: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Admin Users Management
export const getAdminUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
} = {}): Promise<PaginatedResponse<AdminUser>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.role) searchParams.append('role', params.role);
  if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

  const { data } = await apiClient.get('/admin/users', { params: searchParams });
  
  // Return data as is since we're now using proper isActive field
  return data;
};



export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  await apiClient.patch(`/admin/users/${userId}/role`, { role });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
};

// Admin Offers Management
export const getAdminOffers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  companyId?: string;
}): Promise<PaginatedResponse<AdminOffer>> => {
  const queryParams: Record<string, string> = {};
  
  if (params.page) queryParams.page = params.page.toString();
  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.search) queryParams.search = params.search;
  if (params.isActive !== undefined) queryParams.isActive = params.isActive.toString();
  if (params.companyId) queryParams.companyId = params.companyId;

  console.log('Frontend sending query params:', queryParams);

  try {
    const { data } = await apiClient.get('/admin/offers', { params: queryParams });
    console.log('✅ Admin offers API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Admin offers API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
};



export const deleteOffer = async (offerId: string): Promise<void> => {
  await apiClient.delete(`/admin/offers/${offerId}`);
};

export const updateOfferStatus = async (offerId: string, isActive: boolean): Promise<AdminOffer> => {
  const { data } = await apiClient.patch(`/admin/offers/${offerId}/status`, { isActive });
  return data;
};

// Admin Analytics
export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get('/admin/analytics');
  return data;
};

// Admin Messages
export const sendAdminMessage = async (data: {
  recipientId: string;
  subject: string;
  content: string;
  isReadOnly?: boolean;
}): Promise<void> => {
  await apiClient.post('/admin/messages', data);
};

export const sendBroadcastMessage = async (data: {
  targetRole?: 'STUDENT' | 'COMPANY';
  subject: string;
  content: string;
}): Promise<{ conversationId: string; sentTo: number }> => {
  const { data: response } = await apiClient.post('/admin/messages/broadcast', data);
  return response;
};

export const getAdminConversations = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<any>> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const { data } = await apiClient.get('/admin/conversations', { params: searchParams });
  return data;
}; 