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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('studentDirectory.filters.title')}</h3>

      {/* Search and Skills Filters Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Search Filter */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">{t('studentDirectory.filters.search')}</h4>
          <div className="relative min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('studentDirectory.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">{t('studentDirectory.filters.skillsFilter')}</h4>
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
          className="transform rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-200 active:scale-95"
        >
          {t('studentDirectory.filters.clearAllFilters')}
        </button>
      </div>
    </div>
  );
};

export default StudentFilters;
