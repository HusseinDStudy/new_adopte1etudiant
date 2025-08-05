import { useState, useEffect } from 'react';
import { getCompanyStats, CompanyStats } from '../services/statsService';

export interface UseCompanyStatsResult {
  stats: CompanyStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCompanyStats = (): UseCompanyStatsResult => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCompanyStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch company statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch,
  };
};
