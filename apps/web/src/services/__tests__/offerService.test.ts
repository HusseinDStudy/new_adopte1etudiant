import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../apiClient';
import {
  listOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../offerService';

describe('offerService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });
    vi.spyOn(apiClient, 'delete').mockResolvedValue({});
    vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} });
  });

  it('listOffers maps params and returns data', async () => {
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { offers: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } } });

    const res = await listOffers({ search: 'dev', skills: ['React'], page: 2, limit: 9 });
    expect(apiClient.get).toHaveBeenCalledWith('/offers', expect.any(Object));
    expect(res.pagination.page).toBe(1);
  });

  it('getOfferById calls correct URL', async () => {
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: '1', title: 'Offer' } });
    const res = await getOfferById('1');
    expect(apiClient.get).toHaveBeenCalledWith('/offers/1');
    expect(res.id).toBe('1');
  });

  it('createOffer calls POST and returns data', async () => {
    const mockOffer = { id: '2', title: 'New Offer' };
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockOffer });

    const res = await createOffer({ title: 'New', description: 'Desc', location: 'Loc', duration: 'Full-time', salary: 'Competitive' });
    expect(apiClient.post).toHaveBeenCalledWith('/offers', expect.any(Object));
    expect(res.id).toBe('2');
  });

  it('updateOffer calls PUT and returns data', async () => {
    const mockOffer = { id: '1', title: 'Updated Offer' };
    (apiClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockOffer });

    const res = await updateOffer('1', { title: 'Updated' });
    expect(apiClient.put).toHaveBeenCalledWith('/offers/1', expect.any(Object));
    expect(res.title).toBe('Updated Offer');
  });

  it('deleteOffer calls DELETE', async () => {
    (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    await deleteOffer('1');
    expect(apiClient.delete).toHaveBeenCalledWith('/offers/1');
  });
});


