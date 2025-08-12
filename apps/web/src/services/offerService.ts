import apiClient from './apiClient';
import { CreateOfferInput, UpdateOfferInput } from 'shared-types';

export const listOffers = async (filters: { 
  search?: string, 
  location?: string, 
  skills?: string[], 
  companyName?: string, 
  type?: string,
  page?: number,
  limit?: number,
  sortBy?: string
}) => {
  const params = new URLSearchParams();

  // Add parameters if they exist and are not empty
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }
  if (filters.location && filters.location.trim()) {
    params.append('location', filters.location.trim());
  }
  if (filters.skills && filters.skills.length > 0) {
    params.append('skills', filters.skills.join(','));
  }
  if (filters.companyName && filters.companyName.trim()) {
    params.append('companyName', filters.companyName.trim());
  }
  if (filters.type && filters.type.trim()) {
    params.append('type', filters.type.trim());
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  console.log('🔍 Frontend: Fetching offers with params:', Object.fromEntries(params));
  const { data } = await apiClient.get('/offers', { params });
  console.log('✅ Frontend: Received paginated response:', data);
  return data;
};

export const getOfferById = async (id: string) => {
  const { data } = await apiClient.get(`/offers/${id}`);
  return data;
};

export const listMyOffers = async () => {
  const { data } = await apiClient.get('/offers/my-offers');
  return data;
};

export const getOfferApplications = async (offerId: string) => {
  const { data } = await apiClient.get(`/offers/${offerId}/applications`);
  // API returns { applications: [...] }
  return data.applications || [];
};

export const createOffer = async (offerData: CreateOfferInput) => {
  const { data } = await apiClient.post('/offers', offerData);
  return data;
};

export const updateOffer = async (id: string, offerData: UpdateOfferInput) => {
  const { data } = await apiClient.put(`/offers/${id}`, offerData);
  return data;
};

export const deleteOffer = async (id: string) => {
  const { data } = await apiClient.delete(`/offers/${id}`);
  return data;
};

export const getOfferTypes = async () => {
  const { data } = await apiClient.get('/offers/types');
  return data;
};