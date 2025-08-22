import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as messageService from '../../services/messageService';
import { useConversations, useBroadcastConversations } from '../useConversations';

describe('useConversations hooks', () => {
  it('useConversations fetches data with params', async () => {
    vi.spyOn(messageService, 'getMyConversations').mockResolvedValueOnce({
      conversations: [{ id: 'c1' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } as any);
    const { result } = renderHook(() => useConversations({ page: 1, limit: 10 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.conversations[0].id).toBe('c1');
  });

  it('useBroadcastConversations fetches broadcasts', async () => {
    vi.spyOn(messageService, 'getBroadcastConversations').mockResolvedValueOnce({
      conversations: [{ id: 'b1' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } as any);
    const { result } = renderHook(() => useBroadcastConversations({ page: 1 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.conversations[0].id).toBe('b1');
  });
});


