import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import SkillSelector from '../common/SkillSelector';
import { Skill } from '../../hooks/useStudents';

interface StudentFiltersProps {
  searchTerm: string;
  selectedSkills: string[];
  allSkills: Skill[];
  skillsLoading: boolean;
  onSearchChange: (value: string) => void;
  onSkillChange: (skillName: string) => void;
  onClearAllSkills: () => void;
  onClearFilters: () => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  selectedSkills,
  allSkills,
  skillsLoading,
  onSearchChange,
  onSkillChange,
  onClearAllSkills,
  onClearFilters,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('studentDirectory.filters.title')}</h3>

      {/* Search and Skills Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Search Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t('studentDirectory.filters.search')}</h4>
          <div className="relative min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('studentDirectory.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t('studentDirectory.filters.skillsFilter')}</h4>
          <SkillSelector
            skills={allSkills}
            selectedSkills={selectedSkills}
            onSkillChange={onSkillChange}
            onClearAll={onClearAllSkills}
            loading={skillsLoading}
            placeholder={t('studentDirectory.filters.skillsPlaceholder')}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300 transform active:scale-95"
        >
          {t('studentDirectory.filters.clearAllFilters')}
        </button>
      </div>
    </div>
  );
};

export default StudentFilters;
