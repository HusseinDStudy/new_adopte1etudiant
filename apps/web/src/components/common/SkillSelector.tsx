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
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium group hover:bg-blue-200 hover:scale-105 transition-all duration-200 animate-in slide-in-from-left-2"
              >
                {skillName}
                <button
                  onClick={() => removeSkill(skillName)}
                  className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                  aria-label={`Supprimer ${skillName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded hover:scale-105 transition-all duration-200 transform active:scale-95"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        onClick={handleDropdownToggle}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        disabled={loading}
      >
        <span className="text-gray-700">
          {selectedSkills.length > 0 
            ? `${selectedSkills.length} compétence(s) sélectionnée(s)`
            : placeholder
          }
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une compétence..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Skills List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
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
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 flex items-center justify-between transform active:scale-[0.98] ${
                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{skill.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? `Aucune compétence trouvée pour "${searchTerm}"` : 'Aucune compétence disponible'}
              </div>
            )}
          </div>

          {/* Footer with count */}
          {!loading && filteredSkills.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
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
