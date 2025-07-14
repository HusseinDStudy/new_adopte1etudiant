import axios from 'axios';
import { CreateOfferInput, UpdateOfferInput } from 'shared-types';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const listOffers = async (filters: { search?: string, location?: string, skills?: string[], companyName?: string }) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.location) params.append('location', filters.location);
  if (filters.skills && filters.skills.length > 0) {
    params.append('skills', filters.skills.join(','));
  }
  if (filters.companyName) params.append('companyName', filters.companyName);

  const { data } = await apiClient.get('/offers', { params });
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
  return data;
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