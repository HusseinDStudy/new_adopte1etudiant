import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface CompanyStats {
  totalOffers: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  adoptionRequestsSent: number;
}

export interface StudentStats {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  adoptionRequestsReceived: number;
}

export const getCompanyStats = async (): Promise<CompanyStats> => {
  const response = await apiClient.get('/api/companies/stats');
  return response.data;
};

export const getStudentStats = async (): Promise<StudentStats> => {
  const response = await apiClient.get('/api/students/stats');
  return response.data;
};
