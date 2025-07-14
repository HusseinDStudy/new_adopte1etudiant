import axios from 'axios';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getProfile = async () => {
  const { data } = await apiClient.get('/profile');
  return data;
};

export const upsertProfile = async (profileData: StudentProfileInput | CompanyProfileInput) => {
  const { data } = await apiClient.post('/profile', profileData);
  return data;
}; 