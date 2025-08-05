import { useState, useEffect } from 'react';
import { listMyOffers } from '../services/offerService';

export interface MyOffer {
  id: string;
  title: string;
  description: string;
  location: string | null;
  duration: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
}

export interface UseMyOffersResult {
  offers: MyOffer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMyOffers = (): UseMyOffersResult => {
  const [offers, setOffers] = useState<MyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await listMyOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch your offers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

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
