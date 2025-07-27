import { useState, useEffect } from 'react';
import { getStudentStats, StudentStats } from '../services/statsService';

export interface UseStudentStatsResult {
  stats: StudentStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStudentStats = (): UseStudentStatsResult => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStudentStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch student statistics.');
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
