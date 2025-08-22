import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as offerService from '../../services/offerService';
import { useOffers } from '../useOffers';

// don't auto-mock; spy instead

describe('useOffers', () => {
  it('fetches and sets offers with pagination', async () => {
    const mockResponse = {
      data: [
        { id: '1', title: 'Offer 1', description: '', location: null, contractType: '', duration: '', workMode: '', company: { name: 'ACME' }, skills: [], matchScore: 0 },
      ],
      pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
    };
    vi.spyOn(offerService, 'listOffers').mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useOffers({ page: 1, limit: 9 } as any));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.offers.length).toBe(1);
    expect(result.current.pagination?.total).toBe(1);
    expect(result.current.error).toBeNull();
  });
});


