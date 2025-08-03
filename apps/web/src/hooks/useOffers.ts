import { useState, useEffect } from 'react';
import { listOffers } from '../services/offerService';



export interface Offer {
  id: string;
  title: string;
  description: string;
  location: string | null;
  contractType: string;
  duration: string;
  workMode: string;
  company: {
    name: string;
  };
  skills: string[];
  matchScore: number;
}

export interface OfferFilters {
  search?: string;
  location?: string;
  skills?: string[];
  companyName?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseOffersResult {
  offers: Offer[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOffers = (filters: OfferFilters): UseOffersResult => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);

    try {
      const filterParams = {
        search: filters.search,
        location: filters.location,
        skills: filters.skills,
        companyName: filters.companyName,
        type: filters.type,
        page: filters.page || 1,
        limit: filters.limit || 9,
        sortBy: filters.sortBy || 'recent',
      };

      console.log('Fetching offers with filters:', filterParams);
      const response = await listOffers(filterParams);
      console.log('Received paginated response:', response);
      
      // Handle both old format (array) and new format (object with data + pagination)
      if (Array.isArray(response)) {
        // Legacy format - shouldn't happen with new API
        setOffers(response);
        setPagination(null);
      } else {
        // New paginated format
        setOffers(response.data || []);
        setPagination(response.pagination || null);
      }
    } catch (err) {
      setError('Failed to fetch offers.');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [filters.search, filters.location, filters.skills, filters.companyName, filters.type, filters.page, filters.limit, filters.sortBy]);

  const refetch = () => {
    fetchOffers();
  };

  return {
    offers,
    pagination,
    loading,
    error,
    refetch,
  };
};
