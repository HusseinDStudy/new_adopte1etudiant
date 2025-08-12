import apiClient from './apiClient';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';

export const getProfile = async () => {
  const { data } = await apiClient.get('/profile');
  return data;
};

export const upsertProfile = async (profileData: StudentProfileInput | CompanyProfileInput) => {
  const { data } = await apiClient.post('/profile', profileData);
  return data;
}; 