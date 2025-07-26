import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOffers } from '../hooks/useOffers';
import { useOfferFilters } from '../hooks/useOfferFilters';
import { useOfferApplications } from '../hooks/useOfferApplications';

const OfferListPage = () => {
  const { user } = useAuth();

  // Use custom hooks for state management
  const {
    filters,
    debouncedFilters,
    allSkills,
    allCompanies,
    skillsLoading,
    companiesLoading,
    setSearchTerm,
    setLocationFilter,
    setSelectedCompany,
    handleSkillChange,
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



  const getRingColor = (score: number) => {
    if (score > 75) return 'stroke-green-500';
    if (score > 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Explore Opportunities</h1>
          {user?.role === 'STUDENT' && (
            <button
              onClick={refreshAppliedOffers}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              title="Refresh application status"
            >
              🔄 Refresh Status
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
            />
            {/* Location Input */}
            <input
                type="text"
                placeholder="Filter by location..."
                value={filters.locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
            />
            {/* Company Filter */}
            <select
                value={filters.selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={companiesLoading}
            >
                <option value="">All Companies</option>
                {Array.isArray(allCompanies) ? allCompanies.map((company, index) => (
                    <option key={company.id || `company-${index}`} value={company.name}>
                        {company.name}
                    </option>
                )) : null}
            </select>
            {/* Skills Filter */}
            <div className="md:col-span-3">
                <h3 className="font-semibold mb-2">Filter by Skills:</h3>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-white border rounded-lg">
                    {skillsLoading ? (
                        <div>Loading skills...</div>
                    ) : (
                        Array.isArray(allSkills) ? allSkills.map((skill, index) => (
                            <label key={skill.id || `filter-skill-${index}`} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.selectedSkills.includes(skill.name)}
                                    onChange={() => handleSkillChange(skill.name)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{skill.name}</span>
                            </label>
                        )) : null
                    )}
                </div>
                <button
                    onClick={clearFilters}
                    className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Clear Filters
                </button>
            </div>
        </div>
      </div>
      
      {loading ? (
        <div>Loading offers...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(offers) ? offers.map((offer, index) => (
            <div key={offer.id || `offer-${index}`} className="relative rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
               {user?.role === 'STUDENT' && offer.matchScore !== undefined && (
                <div className="absolute top-4 right-4">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={(2 * Math.PI * 30) * (1 - (offer.matchScore || 0) / 100)}
                      className={`transition-all duration-500 ${getRingColor(offer.matchScore || 0)}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    {offer.matchScore || 0}%
                  </span>
                </div>
              )}
              <div className={user?.role === 'STUDENT' && offer.matchScore !== undefined ? "pr-24" : ""}>
                <h2 className="text-xl font-semibold">{offer.title}</h2>
                <p className="mt-1 text-gray-700">{offer.company.name}</p>
                {offer.location && <p className="mt-1 text-sm text-gray-500">{offer.location}</p>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Array.isArray(offer.skills) ? offer.skills.map((skill, index) => (
                  <span key={`skill-${index}`} className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800">
                    {skill}
                  </span>
                )) : null}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Link to={`/offers/${offer.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                  View Details
                </Link>
                {user?.role === 'STUDENT' && appliedOfferIds.has(offer.id) && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    ✓ Applied
                  </div>
                )}
              </div>
            </div>
          )) : null}
        </div>
      )}
    </div>
  );
};

export default OfferListPage; 