import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const createAdoptionRequest = async (studentId: string) => {
  const { data } = await apiClient.post('/adoption-requests', { studentId });
  return data;
};

export const getSentAdoptionRequests = async () => {
  const { data } = await apiClient.get('/adoption-requests/sent-requests');
  return data;
}

export const getMyAdoptionRequests = async () => {
    const { data } = await apiClient.get('/adoption-requests/my-requests');
    return data;
}

export const updateAdoptionRequestStatus = async (id: string, status: string) => {
    const { data } = await apiClient.patch(`/adoption-requests/${id}/status`, { status });
    return data;
} 