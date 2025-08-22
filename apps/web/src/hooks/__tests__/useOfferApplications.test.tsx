import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as appService from '../../services/applicationService';
import * as AuthContext from '../../context/AuthContext';
import { useOfferApplications } from '../useOfferApplications';

describe('useOfferApplications', () => {
  it('fetches applied ids for student and can apply', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'a', role: 'STUDENT' } as any,
      loading: false,
      isAuthenticated: true,
      loginWithCredentials: vi.fn(),
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    } as any);

    vi.spyOn(appService, 'getAppliedOfferIds').mockResolvedValueOnce(['o1']);
    const { result } = renderHook(() => useOfferApplications());
    await waitFor(() => expect(result.current.appliedOfferIds.has('o1')).toBe(true));

    vi.spyOn(appService, 'applyToOffer').mockResolvedValueOnce({} as any);
    await act(async () => {
      await result.current.applyToOfferWithTracking('o2');
    });
    expect(result.current.appliedOfferIds.has('o2')).toBe(true);
  });
});


