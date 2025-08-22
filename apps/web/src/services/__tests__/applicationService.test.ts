import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as applications from '../applicationService';

// Mock the apiClient module itself
vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import the mocked apiClient after the mock definition
import apiClient from '../apiClient';

describe('applicationService', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('applyToOffer calls POST and returns data', async () => {
    const mockResponse = { message: 'Application submitted successfully' };
    (apiClient.post as vi.Mock).mockResolvedValueOnce({ data: mockResponse });

    const res = await applications.applyToOffer('offer123');
    expect(apiClient.post).toHaveBeenCalledWith('/applications', { offerId: 'offer123' });
    expect(res).toEqual(mockResponse);
  });

  it('getMyApplications calls GET and returns data', async () => {
    const mockApplications = [
      { id: 'app1', offer: { id: 'o1', title: 'Offer 1', company: { name: 'CompA' } }, createdAt: new Date().toISOString() },
      { id: 'app2', offer: { id: 'o2', title: 'Offer 2', company: { name: 'CompB' } }, createdAt: new Date().toISOString() },
    ];
    const mockPagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: { applications: mockApplications, pagination: mockPagination } });

    const res = await applications.getMyApplications();
    expect(apiClient.get).toHaveBeenCalledWith('/applications/my-applications');
    expect(res).toEqual(mockApplications);
  });

  it('updateApplicationStatus calls PATCH and returns data', async () => {
    const mockResponse = { message: 'Status updated' };
    (apiClient.patch as vi.Mock).mockResolvedValueOnce({ data: mockResponse });

    const res = await applications.updateApplicationStatus('app123', 'ACCEPTED');
    expect(apiClient.patch).toHaveBeenCalledWith('/applications/app123/status', { status: 'ACCEPTED' });
    expect(res).toEqual(mockResponse);
  });

  it('getAppliedOfferIds returns correct offer IDs', async () => {
    const mockApplications = [
      { id: 'app1', offer: { id: 'offer1' } },
      { id: 'app2', offer: { id: 'offer2' } },
    ];
    // Ensure getMyApplications returns data in the expected format
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: { applications: mockApplications, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } } });

    const res = await applications.getAppliedOfferIds();
    expect(res).toEqual(['offer1', 'offer2']);
  });

  it('getAppliedOfferIds handles 403 error gracefully', async () => {
    (apiClient.get as vi.Mock).mockImplementationOnce(() => {
      const error = new Error('Forbidden');
      (error as any).response = { status: 403 };
      throw error;
    });

    const res = await applications.getAppliedOfferIds();
    expect(res).toEqual([]);
  });
});
