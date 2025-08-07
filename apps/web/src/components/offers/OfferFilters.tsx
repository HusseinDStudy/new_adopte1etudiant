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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('offers.searchFilters')}</h3>
      
      {/* Search, Location and Company Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('offers.searchByTitleOrDescription')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('offers.filterByLocation')}
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Company Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('offers.searchCompany')}
            value={companySearch}
            onChange={(e) => onCompanySearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Type and Skills Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Type Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t('offers.offerType')}</h4>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={offerTypesLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {offerTypesLoading ? (
              <option value="">{t('loading.loadingTypes')}</option>
            ) : (
              typeOptions.map((type) => (
                <option key={type} value={type === 'Tous les types' ? '' : type}>
                  {type}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Skills Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t('offers.filterBySkills')}</h4>
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
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300 transform active:scale-95"
        >
          {t('offers.clearAllFilters')}
        </button>
      </div>
    </div>
  );
};

export default OfferFilters;
