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
}

export interface UseOffersResult {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOffers = (filters: OfferFilters): UseOffersResult => {
  const [offers, setOffers] = useState<Offer[]>([]);
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
      };

      console.log('Fetching offers with filters:', filterParams);
      const data = await listOffers(filterParams);
      console.log('Received offers:', data);
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch offers.');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [filters.search, filters.location, filters.skills, filters.companyName, filters.type]);

  const refetch = () => {
    fetchOffers();
  };

  return {
    offers,
    loading,
    error,
    refetch,
  };
};
