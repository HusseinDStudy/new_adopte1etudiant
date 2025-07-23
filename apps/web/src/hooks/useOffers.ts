import { useState, useEffect } from 'react';
import { listOffers } from '../services/offerService';

export interface Offer {
  id: string;
  title: string;
  description: string;
  location: string | null;
  company: {
    name: string;
  };
  skills: {
    id: string;
    name: string;
  }[];
  matchScore: number;
}

export interface OfferFilters {
  search?: string;
  location?: string;
  skills?: string[];
  companyName?: string;
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
      };
      
      const data = await listOffers(filterParams);
      setOffers(data);
    } catch (err) {
      setError('Failed to fetch offers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [filters.search, filters.location, filters.skills, filters.companyName]);

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
