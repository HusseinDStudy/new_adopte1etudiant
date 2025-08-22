import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as statsService from '../../services/statsService';
import { useCompanyStats } from '../useCompanyStats';

describe('useCompanyStats', () => {
  it('loads company stats successfully', async () => {
    const mockStats = { totalOffers: 3, totalApplications: 10, applicationsByStatus: { PENDING: 5 }, adoptionRequestsSent: 2 } as any;
    vi.spyOn(statsService, 'getCompanyStats').mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useCompanyStats());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it('sets error when service fails', async () => {
    vi.spyOn(statsService, 'getCompanyStats').mockRejectedValueOnce(new Error('oops'));

    const { result } = renderHook(() => useCompanyStats());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Failed to fetch company statistics.');
  });
});


