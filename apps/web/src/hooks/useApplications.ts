import { useState, useEffect } from 'react';
import { getMyApplications, deleteApplication } from '../services/applicationService';

export interface Application {
  id: string;
  status: string;
  createdAt: string;
  offer: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  conversation?: {
    id: string;
  };
}

export interface UseApplicationsResult {
  applications: Application[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteApp: (applicationId: string) => Promise<void>;
  deleting: boolean;
}

export const useApplications = (): UseApplicationsResult => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch applications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const deleteApp = async (applicationId: string) => {
    setDeleting(true);
    try {
      await deleteApplication(applicationId);
      // Remove the application from the local state
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err) {
      setError('Failed to delete application.');
      console.error(err);
      throw err; // Re-throw so the component can handle it
    } finally {
      setDeleting(false);
    }
  };

  const refetch = () => {
    fetchApplications();
  };

  return {
    applications,
    loading,
    error,
    refetch,
    deleteApp,
    deleting,
  };
};
