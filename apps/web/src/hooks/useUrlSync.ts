import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for synchronizing state with URL search parameters
 * Provides easy URL sync for pagination and other filters
 */
export const useUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get page from URL or default to 1
  const getPageFromUrl = (): number => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(page) || page < 1 ? 1 : page;
  };

  // Update URL with new page
  const updatePageInUrl = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (page === 1) {
      // Remove page parameter for page 1 to keep URL clean
      newParams.delete('page');
    } else {
      newParams.set('page', page.toString());
    }
    
    setSearchParams(newParams, { replace: true });
  };

  // Get all current search params as object
  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };

  // Update multiple search params at once
  const updateSearchParams = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 0) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    setSearchParams(newParams, { replace: true });
  };

  // Clear all search params
  const clearSearchParams = () => {
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return {
    isInitialized,
    getPageFromUrl,
    updatePageInUrl,
    getSearchParamsObject,
    updateSearchParams,
    clearSearchParams,
    searchParams
  };
};