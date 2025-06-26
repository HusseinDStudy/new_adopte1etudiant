import axios from 'axios';
import { LoginInput, RegisterInput } from 'shared-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies
});

export const login = async (credentials: LoginInput) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const register = async (credentials: RegisterInput) => {
  const { data } = await apiClient.post('/auth/register', credentials);
  return data;
};

export const logout = async () => {
  const { data } = await apiClient.post('/auth/logout');
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

// TODO: Add register function 