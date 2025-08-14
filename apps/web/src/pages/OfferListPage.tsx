import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useOffers } from '../hooks/useOffers';
import { useOfferFilters } from '../hooks/useOfferFilters';
import { useOfferApplications } from '../hooks/useOfferApplications';
import { useUrlSync } from '../hooks/useUrlSync';
import OfferCard from '../components/offers/OfferCard';
import OfferFilters from '../components/offers/OfferFilters';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import Pagination from '../components/common/Pagination';
import { Offer } from 'shared-types';

type SortOption = 'recent' | 'relevance' | 'location';

const OfferListPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const itemsPerPage = 9; // 3x3 grid
  
  // URL synchronization
  const { isInitialized, getPageFromUrl, updatePageInUrl } = useUrlSync();
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());

  // Update current page when URL changes
  useEffect(() => {
    if (isInitialized) {
      setCurrentPage(getPageFromUrl());
    }
  }, [isInitialized, getPageFromUrl]);

  // Use custom hooks for state management
  const {
    filters,
    debouncedFilters,
    allSkills,
    allOfferTypes,
    skillsLoading,
    offerTypesLoading,
    setSearchTerm,
    setLocationFilter,
    setCompanySearch,
    setSelectedType,
    handleSkillChange,
    clearAllSkills,
    clearFilters,
  } = useOfferFilters();

  const {
    offers,
    pagination,
    loading,
    error,
    refetch,
  } = useOffers({
    ...debouncedFilters,
    page: currentPage,
    limit: itemsPerPage,
    sortBy
  });

  const {
    appliedOfferIds,
    refreshAppliedOffers,
  } = useOfferApplications();

  // Server-side pagination - no need to sort or paginate client-side
  // The server handles filtering, sorting, and pagination
  const displayedOffers = offers || [];
  
  // Reset to page 1 when filters or sort change
  const prevFiltersRef = React.useRef<string>('');
  React.useEffect(() => {
    const filtersString = JSON.stringify({
      search: debouncedFilters.search,
      location: debouncedFilters.location,
      companyName: debouncedFilters.companyName,
      type: debouncedFilters.type,
      skills: debouncedFilters.skills,
      sortBy
    });

    if (prevFiltersRef.current !== '' && prevFiltersRef.current !== filtersString) {
      setCurrentPage(1);
      updatePageInUrl(1);
    }

    prevFiltersRef.current = filtersString;
  }, [debouncedFilters.search, debouncedFilters.location, debouncedFilters.companyName, debouncedFilters.type, debouncedFilters.skills, sortBy, updatePageInUrl]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updatePageInUrl(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get sort description for display
  const getSortDescription = () => {
    switch (sortBy) {
      case 'recent':
        return t('offers.sortedByDate');
      case 'relevance':
        return t('offers.sortedByRelevance');
      case 'location':
        return t('offers.sortedByLocation');
      default:
        return '';
    }
  };

  // Remove the mock metrics - we don't need them on this page

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-bold text-gray-900">{t('offers.internshipAndApprenticeshipOffers')}</h1>
            <p className="mt-2 text-gray-600">{t('offers.findTalentForYourNeeds')}</p>
          </div>
          {user?.role === 'STUDENT' && (
            <button
              onClick={refreshAppliedOffers}
              className="flex transform items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-md active:scale-95"
              title={t('offers.refreshApplicationStatus')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t('offers.refresh')}</span>
            </button>
          )}
        </div>

        {/* Remove dashboard metrics from this page - they belong in the dashboard */}
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <OfferFilters
          searchTerm={filters.searchTerm}
          locationFilter={filters.locationFilter}
          companySearch={filters.companySearch}
          selectedType={filters.selectedType}
          selectedSkills={filters.selectedSkills}
          allSkills={allSkills}
          allOfferTypes={allOfferTypes}
          skillsLoading={skillsLoading}
          offerTypesLoading={offerTypesLoading}
          onSearchChange={setSearchTerm}
          onLocationChange={setLocationFilter}
          onCompanySearchChange={setCompanySearch}
          onTypeChange={setSelectedType}
          onSkillChange={handleSkillChange}
          onClearAllSkills={clearAllSkills}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('offers.loadingOffers')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <svg className="mx-auto mb-4 h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mb-2 text-lg font-medium text-red-800">{t('offers.loadingError')}</h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('offers.foundOffers', { count: pagination?.total || 0 })}
              </h2>
              {displayedOffers.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {getSortDescription()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <label htmlFor="sort-by" className="shrink-0">
                {t('offers.sortBy')}:
              </label>
              <select
                id="sort-by"
                aria-label={t('offers.sortBy') || 'Sort by'}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="recent">📅 {t('offers.mostRecent')}</option>
                <option value="relevance">⭐ {t('offers.relevance')}</option>
                <option value="location">📍 {t('offers.location')}</option>
              </select>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedOffers.map((offer, index) => (
              <OfferCard
                key={offer.id || `offer-${index}`}
                offer={offer}
                isApplied={appliedOfferIds.has(offer.id)}
                userRole={user?.role}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
            />
          )}

          {/* Empty State */}
          {displayedOffers.length === 0 && !loading && (
            <div className="py-12 text-center">
              <svg className="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">{t('offers.noOffersFound')}</h3>
              <p className="mb-4 text-gray-500">{t('offers.tryModifyingSearchCriteria')}</p>
              <button
                onClick={clearFilters}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                {t('offers.clearFilters')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OfferListPage; 