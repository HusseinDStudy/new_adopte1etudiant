import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCompanyStats, getStudentStats } from '../statsService';
import apiClient from '../apiClient';

vi.mock('../apiClient');

describe('statsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getCompanyStats fetches company statistics', async () => {
    const mockCompanyStats = {
      totalOffers: 5,
      totalApplications: 10,
      applicationsByStatus: { PENDING: 5, ACCEPTED: 3, REJECTED: 2 },
      adoptionRequestsSent: 2,
    };
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: mockCompanyStats });

    const result = await getCompanyStats();
    expect(apiClient.get).toHaveBeenCalledWith('/companies/stats');
    expect(result).toEqual(mockCompanyStats);
  });

  it('getStudentStats fetches student statistics', async () => {
    const mockStudentStats = {
      totalApplications: 15,
      applicationsByStatus: { PENDING: 8, ACCEPTED: 5, REJECTED: 2 },
      adoptionRequestsReceived: 3,
    };
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: mockStudentStats });

    const result = await getStudentStats();
    expect(apiClient.get).toHaveBeenCalledWith('/students/stats');
    expect(result).toEqual(mockStudentStats);
  });
});


