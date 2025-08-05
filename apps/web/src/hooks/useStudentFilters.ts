import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export interface StudentFilters {
  search: string;
  skills: string[];
}

export interface UseStudentFiltersResult {
  // Filter state
  filters: StudentFilters;
  debouncedFilters: StudentFilters;

  // Individual filter values
  searchTerm: string;
  selectedSkills: string[];

  // Actions
  setSearchTerm: (value: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  handleSkillChange: (skillName: string) => void;
  clearAllSkills: () => void;
  clearFilters: () => void;
}

export const useStudentFilters = (): UseStudentFiltersResult => {
  // Individual filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Combined filters object
  const filters: StudentFilters = {
    search: searchTerm,
    skills: selectedSkills,
  };

  // Debounced filters for API calls
  const debouncedFilters: StudentFilters = {
    search: debouncedSearchTerm,
    skills: selectedSkills,
  };

  // Handle skill selection/deselection
  const handleSkillChange = (skillName: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillName)) {
        return prev.filter(skill => skill !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
  };

  // Clear all skills
  const clearAllSkills = () => {
    setSelectedSkills([]);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
  };

  return {
    filters,
    debouncedFilters,
    searchTerm,
    selectedSkills,
    setSearchTerm,
    setSelectedSkills,
    handleSkillChange,
    clearAllSkills,
    clearFilters,
  };
};
