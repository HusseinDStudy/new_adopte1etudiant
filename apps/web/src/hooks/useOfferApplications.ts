import { useState, useEffect } from 'react';
import { applyToOffer, getAppliedOfferIds } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';

export interface UseOfferApplicationsResult {
  // Application tracking
  appliedOfferIds: Set<string>;
  setAppliedOfferIds: (ids: Set<string>) => void;
  refreshAppliedOffers: () => Promise<void>;
  
  // Application actions
  applyToOfferWithTracking: (offerId: string) => Promise<void>;
  applicationLoading: boolean;
}

export const useOfferApplications = (): UseOfferApplicationsResult => {
  const [appliedOfferIds, setAppliedOfferIds] = useState<Set<string>>(new Set());
  const [applicationLoading, setApplicationLoading] = useState(false);
  const { user } = useAuth();

  // Fetch applied offer IDs (only for students)
  const refreshAppliedOffers = async () => {
    // Only fetch applications for student users
    if (user?.role !== 'STUDENT') {
      return;
    }

    try {
      const appliedIds = await getAppliedOfferIds();
      setAppliedOfferIds(new Set(appliedIds));
    } catch (err) {
      console.error('Failed to fetch applied offer IDs:', err);
    }
  };

  // Load applied offers on initialization (only for students)
  useEffect(() => {
    if (user?.role === 'STUDENT') {
      refreshAppliedOffers();
    }
  }, [user?.role]);

  // Apply to offer with state tracking (only for students)
  const applyToOfferWithTracking = async (offerId: string) => {
    // Only allow students to apply
    if (user?.role !== 'STUDENT') {
      throw new Error('Only students can apply to offers');
    }

    setApplicationLoading(true);
    try {
      await applyToOffer(offerId);
      // Add to applied offers list on success
      setAppliedOfferIds(prev => new Set(prev).add(offerId));
    } catch (err: any) {
      console.error('Failed to apply to offer:', err);
      // If it's a 409 error (already applied), update our local state
      if (err.response?.status === 409 || err.message?.includes('already applied')) {
        setAppliedOfferIds(prev => new Set(prev).add(offerId));
      }
      // Re-throw the error for component handling
      throw err;
    } finally {
      setApplicationLoading(false);
    }
  };

  return {
    appliedOfferIds,
    setAppliedOfferIds,
    refreshAppliedOffers,
    applyToOfferWithTracking,
    applicationLoading,
  };
};
