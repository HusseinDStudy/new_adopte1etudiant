import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getCompaniesWithOffers = async () => {
    const { data } = await apiClient.get('/companies');
    return data;
}