import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const createAdoptionRequest = async (studentId: string, message: string) => {
  try {
    const { data } = await apiClient.post('/adoption-requests', { studentId, message });
    return data;
  } catch (error: any) {
    // Provide more specific error messages
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 'Invalid request data';
      throw new Error(errorMessage);
    } else if (error.response?.status === 409) {
      throw new Error('You have already sent an adoption request to this student');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('Failed to send adoption request. Please check your connection and try again.');
    }
  }
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