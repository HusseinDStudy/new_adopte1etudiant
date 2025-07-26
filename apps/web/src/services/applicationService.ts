import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const applyToOffer = async (offerId: string) => {
  try {
    const { data } = await apiClient.post('/applications', { offerId });
    return data;
  } catch (error: any) {
    // Provide more specific error messages
    if (error.response?.status === 409) {
      throw new Error('You have already applied to this offer');
    } else if (error.response?.status === 403) {
      throw new Error('You must complete your profile before applying');
    } else if (error.response?.status === 404) {
      throw new Error('This offer is no longer available');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('Failed to submit application. Please check your connection and try again.');
    }
  }
};

export const getMyApplications = async () => {
  const { data } = await apiClient.get('/applications/my-applications');
  // API returns { applications: [...], pagination: {...} }
  return data.applications || [];
};

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const { data } = await apiClient.patch(`/applications/${applicationId}/status`, { status });
  return data;
};

export const getAppliedOfferIds = async (): Promise<string[]> => {
  try {
    const applications = await getMyApplications();
    return applications.map((app: any) => app.offer.id);
  } catch (error) {
    console.error('Failed to fetch applied offer IDs:', error);
    return [];
  }
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