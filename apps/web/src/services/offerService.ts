import axios from 'axios';
import { CreateOfferInput, UpdateOfferInput } from 'shared-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const listOffers = async (searchTerm?: string) => {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.append('search', searchTerm);
  }
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