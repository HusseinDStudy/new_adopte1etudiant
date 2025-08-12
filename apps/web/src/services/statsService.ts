import apiClient from './apiClient';

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
  const response = await apiClient.get('/companies/stats');
  return response.data;
};

export const getStudentStats = async (): Promise<StudentStats> => {
  const response = await apiClient.get('/students/stats');
  return response.data;
};
