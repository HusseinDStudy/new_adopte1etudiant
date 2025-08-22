import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as admin from '../adminService'; // Import the service functions

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
// This ensures that `apiClient` refers to the mocked version within this test file.
import apiClient from '../apiClient';

describe('adminService', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Restore all mocks to ensure test isolation
  });

  it('getAdminUsers passes params and returns data', async () => {
    // Ensure the mock for apiClient.get is set correctly for this test
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } });
    const res = await admin.getAdminUsers({ page: 1, limit: 10, search: 'a', role: 'ADMIN', isActive: true });
    expect(apiClient.get).toHaveBeenCalledWith('/admin/users', expect.any(Object));
    expect(res.pagination.page).toBe(1);
  });

  it('updateOfferStatus calls PATCH and returns data', async () => {
    // Ensure the mock for apiClient.patch is set correctly for this test
    (apiClient.patch as vi.Mock).mockResolvedValueOnce({ data: { id: 'o1', isActive: true } });
    const res = await admin.updateOfferStatus('o1', true);
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/offers/o1/status', { isActive: true });
    expect(res.isActive).toBe(true);
  });

  it('sendBroadcastMessage omits undefined targetRole', async () => {
    // Ensure the mock for apiClient.post is set correctly for this test
    (apiClient.post as vi.Mock).mockResolvedValueOnce({ data: { conversationId: 'c1', sentTo: 10 } });
    const res = await admin.sendBroadcastMessage({ subject: 's', content: 'c' });
    expect(apiClient.post).toHaveBeenCalledWith('/admin/messages/broadcast', { subject: 's', content: 'c' });
    expect(res.sentTo).toBe(10);
  });
});


