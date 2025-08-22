import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as offerService from '../../services/offerService';
import { useMyOffers } from '../useMyOffers';

describe('useMyOffers', () => {
  it('fetches list of my offers', async () => {
    vi.spyOn(offerService, 'listMyOffers').mockResolvedValueOnce([{ id: 'o1', title: 't', description: '', location: null, duration: null, skills: [], createdAt: '', updatedAt: '', _count: { applications: 0 } }] as any);

    const { result } = renderHook(() => useMyOffers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.offers.length).toBe(1);
  });
});


