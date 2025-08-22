import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as company from '../companyService';

// Mock the apiClient module itself
vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Import the mocked apiClient after the mock definition
import apiClient from '../apiClient';

describe('companyService', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('getCompaniesWithOffers calls /companies', async () => {
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: [] });
    const res = await company.getCompaniesWithOffers();
    expect(apiClient.get).toHaveBeenCalledWith('/companies');
    expect(res).toEqual([]);
  });
});


