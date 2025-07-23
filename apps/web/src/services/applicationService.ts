import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const applyToOffer = async (offerId: string) => {
  const { data } = await apiClient.post('/applications', { offerId });
  return data;
};

export const getMyApplications = async () => {
  const { data } = await apiClient.get('/applications/my-applications');
  return data;
};

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const { data } = await apiClient.patch(`/applications/${applicationId}/status`, { status });
  return data;
};

export const getMessages = async (applicationId: string) => {
  const { data } = await apiClient.get(`/applications/${applicationId}/messages`);
  return data;
}

export const sendMessage = async (applicationId: string, content: string) => {
  const { data } = await apiClient.post(`/applications/${applicationId}/messages`, { content });
  return data;
};

export const deleteApplication = async (applicationId: string) => {
  const { data } = await apiClient.delete(`/applications/${applicationId}`);
  return data;
};