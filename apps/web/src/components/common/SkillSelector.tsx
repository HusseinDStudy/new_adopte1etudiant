import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Skill {
  id: string;
  name: string;
}

interface SkillSelectorProps {
  skills: Skill[];
  selectedSkills: string[];
  onSkillChange: (skillName: string) => void;
  onClearAll: () => void;
  loading?: boolean;
  placeholder?: string;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  skills,
  selectedSkills,
  onSkillChange,
  onClearAll,
  loading = false,
  placeholder = "Rechercher des compétences..."
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter skills based on search term
  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSkillToggle = (skillName: string) => {
    onSkillChange(skillName);
    setSearchTerm(''); // Clear search after selection
  };

  const removeSkill = (skillName: string) => {
    onSkillChange(skillName);
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Skills Tags */}
      {selectedSkills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skillName) => (
              <span
                key={skillName}
                className="group inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 transition-all duration-200 animate-in slide-in-from-left-2 hover:scale-105 hover:bg-blue-200"
              >
                {skillName}
                <button
                  onClick={() => removeSkill(skillName)}
                  className="ml-1 rounded-full p-0.5 transition-colors hover:bg-blue-300"
                  aria-label={`Supprimer ${skillName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={onClearAll}
              className="transform rounded px-2 py-1 text-xs text-gray-500 transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        onClick={handleDropdownToggle}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <span className="text-gray-700">
          {selectedSkills.length > 0 
            ? `${selectedSkills.length} compétence(s) sélectionnée(s)`
            : placeholder
          }
        </span>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg duration-200 animate-in slide-in-from-top-2">
          {/* Search Input */}
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une compétence..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Skills List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                {t('loading.loadingSkills')}
              </div>
            ) : filteredSkills.length > 0 ? (
              <div className="py-2">
                {filteredSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.name);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillToggle(skill.name)}
                      className={`flex w-full transform items-center justify-between px-4 py-2 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 active:scale-[0.98] ${
                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{skill.name}</span>
                      {isSelected && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? `Aucune compétence trouvée pour "${searchTerm}"` : 'Aucune compétence disponible'}
              </div>
            )}
          </div>

          {/* Footer with count */}
          {!loading && filteredSkills.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-3">
              <div className="text-center text-xs text-gray-500">
                {searchTerm 
                  ? `${filteredSkills.length} compétence(s) trouvée(s)`
                  : `${skills.length} compétence(s) disponible(s)`
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillSelector;
