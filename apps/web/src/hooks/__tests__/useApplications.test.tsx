import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as applicationService from '../../services/applicationService';
import { useApplications } from '../useApplications';

describe('useApplications', () => {
  it('fetches applications and can delete', async () => {
    vi.spyOn(applicationService, 'getMyApplications').mockResolvedValueOnce([
      { id: 'a1', status: 'PENDING', createdAt: '', offer: { id: 'o1', title: 'Offer 1', company: { name: 'ACME' } } },
    ] as any);
    vi.spyOn(applicationService, 'deleteApplication').mockResolvedValueOnce(undefined as any);

    const { result } = renderHook(() => useApplications());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.applications.length).toBe(1);

    await act(async () => {
      await result.current.deleteApp('a1');
    });
    expect(result.current.applications.length).toBe(0);
  });
});


