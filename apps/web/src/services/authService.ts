import axios from 'axios';
import { LoginInput, RegisterInput, CompleteOauthInput } from 'shared-types';

const API_URL = import.meta.env.VITE_API_URL;// || 'http://localhost:8080/api';

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

export const completeOauthRegistration = async (token: string, details: CompleteOauthInput) => {
  const { data } = await apiClient.post(
    '/auth/complete-oauth-registration',
    details,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};


export const completeLink = async (token: string, choice: 'google_only' | 'keep_both') => {
  const response = await apiClient.post('/auth/complete-link', { choice }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteAccountWithPassword = async (password: string) => {
  const { data } = await apiClient.delete('/auth/account', {
    data: { password },
  });
  return data;
};

export const disablePassword = async () => {
  const { data } = await apiClient.post('/auth/disable-password');
  return data;
};

// TODO: Add register function 

export const getMyProfile = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export const login2fa = async (token: string) => {
  const { data } = await apiClient.post('/auth/login/verify-2fa', { token });
  return data;
}

export const generate2faSecret = async () => {
  const { data } = await apiClient.post('/2fa/generate');
  return data;
}

export const verify2fa = async (token: string) => {
  const { data } = await apiClient.post('/2fa/verify', { token });
  return data;
}

export const disable2fa = async (token: string) => {
  const { data } = await apiClient.post('/2fa/disable', { token });
  return data;
} 