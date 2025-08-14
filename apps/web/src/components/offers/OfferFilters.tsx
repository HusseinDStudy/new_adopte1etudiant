import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SkillSelector from '../common/SkillSelector';
import { Skill } from '../../hooks/useOfferFilters';

interface OfferFiltersProps {
  searchTerm: string;
  locationFilter: string;
  companySearch: string;
  selectedType: string;
  selectedSkills: string[];
  allSkills: Skill[];
  allOfferTypes: string[];
  skillsLoading: boolean;
  offerTypesLoading: boolean;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCompanySearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSkillChange: (skillName: string) => void;
  onClearAllSkills: () => void;
  onClearFilters: () => void;
}

const OfferFilters: React.FC<OfferFiltersProps> = ({
  searchTerm,
  locationFilter,
  companySearch,
  selectedType,
  selectedSkills,
  allSkills,
  allOfferTypes,
  skillsLoading,
  offerTypesLoading,
  onSearchChange,
  onLocationChange,
  onCompanySearchChange,
  onTypeChange,
  onSkillChange,
  onClearAllSkills,
  onClearFilters,
}) => {
  const { t } = useTranslation();
  // Type options for offers - from database + default option
  const typeOptions = [t('common.all'), ...allOfferTypes];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('offers.searchFilters')}</h2>
      
      {/* Search, Location and Company Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search Input */}
        <div className="relative min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('offers.searchByTitleOrDescription')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location Filter */}
        <div className="relative min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('offers.filterByLocation')}
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Company Search */}
        <div className="relative min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('offers.searchCompany')}
            value={companySearch}
            onChange={(e) => onCompanySearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Type and Skills Filters Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Type Filter */}
        <div>
          <label htmlFor="offer-type" className="mb-3 block font-medium text-gray-900">{t('offers.offerType')}</label>
          <select
            id="offer-type"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={offerTypesLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {offerTypesLoading ? (
              <option value="">{t('loading.loadingTypes')}</option>
            ) : (
              typeOptions.map((type) => (
                <option key={type} value={type === t('common.all') ? '' : type}>
                  {type}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Skills Filter */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">{t('offers.filterBySkills')}</h3>
          <SkillSelector
            skills={allSkills}
            selectedSkills={selectedSkills}
            onSkillChange={onSkillChange}
            onClearAll={onClearAllSkills}
            loading={skillsLoading}
            placeholder={t('offers.selectSkills')}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <button
          onClick={onClearFilters}
          className="transform rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-200 active:scale-95"
        >
          {t('offers.clearAllFilters')}
        </button>
      </div>
    </div>
  );
};

export default OfferFilters;
