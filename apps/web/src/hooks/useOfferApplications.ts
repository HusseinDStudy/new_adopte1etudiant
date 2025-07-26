import { useState, useEffect } from 'react';
import { applyToOffer, getAppliedOfferIds } from '../services/applicationService';

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

  // Fetch applied offer IDs
  const refreshAppliedOffers = async () => {
    try {
      const appliedIds = await getAppliedOfferIds();
      setAppliedOfferIds(new Set(appliedIds));
    } catch (err) {
      console.error('Failed to fetch applied offer IDs:', err);
    }
  };

  // Load applied offers on initialization
  useEffect(() => {
    refreshAppliedOffers();
  }, []);

  // Apply to offer with state tracking
  const applyToOfferWithTracking = async (offerId: string) => {
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
