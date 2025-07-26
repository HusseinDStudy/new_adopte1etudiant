import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const createAdoptionRequest = async (studentId: string, message: string) => {
  const { data } = await apiClient.post('/adoption-requests', { studentId, message });
  return data;
};

export const getSentAdoptionRequests = async () => {
  const { data } = await apiClient.get('/adoption-requests/sent-requests');
  // API returns { requests: [...], pagination: {...} }
  return data.requests || [];
}

export const getMyAdoptionRequests = async () => {
    const { data } = await apiClient.get('/adoption-requests/my-requests');
    // API returns { requests: [...], pagination: {...} }
    return data.requests || [];
}

export const updateAdoptionRequestStatus = async (id: string, status: string) => {
    const { data } = await apiClient.patch(`/adoption-requests/${id}/status`, { status });
    return data;
} 