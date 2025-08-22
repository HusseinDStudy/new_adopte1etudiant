import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as adminService from '../../services/adminService';
import { useAdminUsers, useAdminOffers, useAdminStats, useAdminUserMutations, useAdminOfferMutations, useAdminMessaging, useAdminConversations } from '../useAdmin';

describe('useAdmin hooks', () => {
  it('useAdminUsers fetches users and exposes pagination', async () => {
    vi.spyOn(adminService, 'getAdminUsers').mockResolvedValueOnce({ data: [{ id: 'u1' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);
    const { result } = renderHook(() => useAdminUsers({ page: 1 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users.length).toBe(1);
    expect(result.current.pagination?.page).toBe(1);
  });

  it('useAdminOffers fetches offers and exposes pagination', async () => {
    vi.spyOn(adminService, 'getAdminOffers').mockResolvedValueOnce({ data: [{ id: 'o1' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);
    const { result } = renderHook(() => useAdminOffers({ page: 1 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.offers.length).toBe(1);
  });

  it('useAdminStats fetches stats', async () => {
    vi.spyOn(adminService, 'getAdminStats').mockResolvedValueOnce({ totalUsers: 0 } as any);
    const { result } = renderHook(() => useAdminStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats?.totalUsers).toBe(0);
  });

  it('useAdminUserMutations updateStatus and updateRole call services', async () => {
    vi.spyOn(adminService, 'updateUserStatus').mockResolvedValueOnce(undefined as any);
    vi.spyOn(adminService, 'updateUserRole').mockResolvedValueOnce(undefined as any);
    const { result } = renderHook(() => useAdminUserMutations());
    await act(async () => { await result.current.updateStatus('u1', true); });
    await act(async () => { await result.current.updateRole('u1', 'ADMIN'); });
    expect(adminService.updateUserStatus).toHaveBeenCalledWith('u1', true);
    expect(adminService.updateUserRole).toHaveBeenCalledWith('u1', 'ADMIN');
  });

  it('useAdminOfferMutations updateStatus/deleteOffer call services', async () => {
    vi.spyOn(adminService, 'updateOfferStatus').mockResolvedValueOnce({} as any);
    vi.spyOn(adminService, 'deleteOffer').mockResolvedValueOnce(undefined as any);
    const { result } = renderHook(() => useAdminOfferMutations());
    await act(async () => { await result.current.updateStatus('o1', true); });
    await act(async () => { await result.current.deleteOffer('o1'); });
    expect(adminService.updateOfferStatus).toHaveBeenCalled();
    expect(adminService.deleteOffer).toHaveBeenCalled();
  });

  it('useAdminMessaging sendMessage/sendBroadcast call services', async () => {
    vi.spyOn(adminService, 'sendAdminMessage').mockResolvedValueOnce(undefined as any);
    vi.spyOn(adminService, 'sendBroadcastMessage').mockResolvedValueOnce({ conversationId: 'c1', sentTo: 2 } as any);
    const { result } = renderHook(() => useAdminMessaging());
    await act(async () => { await result.current.sendMessage({ recipientId: 'u1', subject: 's', content: 'c' }); });
    await act(async () => { const res = await result.current.sendBroadcast({ subject: 's', content: 'c' }); expect(res.sentTo).toBe(2); });
    expect(adminService.sendAdminMessage).toHaveBeenCalled();
    expect(adminService.sendBroadcastMessage).toHaveBeenCalled();
  });

  it('useAdminConversations fetches conversations', async () => {
    vi.spyOn(adminService, 'getAdminConversations').mockResolvedValueOnce({ data: [{ id: 'c1' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);
    const { result } = renderHook(() => useAdminConversations({ page: 1 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.conversations[0].id).toBe('c1');
  });
});


