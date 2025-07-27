import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffers } from '../hooks/useOffers';
import { useOfferFilters } from '../hooks/useOfferFilters';
import { useOfferApplications } from '../hooks/useOfferApplications';
import OfferCard from '../components/OfferCard';
import OfferFilters from '../components/OfferFilters';
import DashboardMetrics from '../components/DashboardMetrics';
import Pagination from '../components/Pagination';
import { Offer } from 'shared-types';

type SortOption = 'recent' | 'relevance' | 'location';

const OfferListPage = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

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
    loading,
    error,
    refetch,
  } = useOffers(debouncedFilters);

  const {
    appliedOfferIds,
    refreshAppliedOffers,
  } = useOfferApplications();

  // Sort offers based on selected options (filtering is now done server-side)
  const filteredAndSortedOffers = useMemo(() => {
    if (!offers || !Array.isArray(offers)) return [];

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        return offers.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      case 'relevance':
        // Sort by match score for students, or by number of applications for companies
        return offers.sort((a, b) => {
          if (user?.role === 'STUDENT') {
            return (b.matchScore || 0) - (a.matchScore || 0);
          }
          return (b._count?.applications || 0) - (a._count?.applications || 0);
        });
      case 'location':
        return offers.sort((a, b) =>
          (a.location || '').localeCompare(b.location || '')
        );
      default:
        return offers;
    }
  }, [offers, sortBy, user?.role]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOffers = filteredAndSortedOffers.slice(startIndex, endIndex);



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
    }

    prevFiltersRef.current = filtersString;
  }, [debouncedFilters.search, debouncedFilters.location, debouncedFilters.companyName, debouncedFilters.type, debouncedFilters.skills, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get sort description for display
  const getSortDescription = () => {
    switch (sortBy) {
      case 'recent':
        return 'triées par date de publication';
      case 'relevance':
        return 'triées par pertinence';
      case 'location':
        return 'triées par localisation';
      default:
        return '';
    }
  };

  // Remove the mock metrics - we don't need them on this page

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offres de Stage et d'Alternance</h1>
            <p className="text-gray-600 mt-2">Trouvez le talent qui correspond à vos besoins</p>
          </div>
          {user?.role === 'STUDENT' && (
            <button
              onClick={refreshAppliedOffers}
              className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:scale-105 hover:shadow-md transition-all duration-300 transform active:scale-95"
              title="Actualiser le statut des candidatures"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualiser</span>
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
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des offres...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredAndSortedOffers.length} offre(s) trouvée(s)
              </h2>
              {filteredAndSortedOffers.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {getSortDescription()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Trier par:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="recent">📅 Plus récentes</option>
                <option value="relevance">⭐ Pertinence</option>
                <option value="location">📍 Localisation</option>
              </select>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedOffers.map((offer, index) => (
              <OfferCard
                key={offer.id || `offer-${index}`}
                offer={offer}
                isApplied={appliedOfferIds.has(offer.id)}
                userRole={user?.role}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredAndSortedOffers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredAndSortedOffers.length}
            />
          )}

          {/* Empty State */}
          {filteredAndSortedOffers.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
              <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OfferListPage; 