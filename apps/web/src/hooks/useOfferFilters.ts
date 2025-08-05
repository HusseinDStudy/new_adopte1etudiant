import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { getAllSkills } from '../services/skillService';
import { getOfferTypes } from '../services/offerService';

export interface Skill {
  id: string;
  name: string;
}

export interface FilterState {
  searchTerm: string;
  locationFilter: string;
  companySearch: string;
  selectedType: string;
  selectedSkills: string[];
}

export interface DebouncedFilters {
  search: string;
  location: string;
  companyName: string;
  type: string;
  skills: string[];
}

export interface UseOfferFiltersResult {
  // Filter state
  filters: FilterState;

  // Debounced values for API calls
  debouncedFilters: DebouncedFilters;

  // Filter options
  allSkills: Skill[];
  allOfferTypes: string[];

  // Loading states
  skillsLoading: boolean;
  offerTypesLoading: boolean;

  // Actions
  setSearchTerm: (value: string) => void;
  setLocationFilter: (value: string) => void;
  setCompanySearch: (value: string) => void;
  setSelectedType: (value: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  handleSkillChange: (skillName: string) => void;
  clearAllSkills: () => void;
  clearFilters: () => void;
}

export const useOfferFilters = (): UseOfferFiltersResult => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Filter options
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allOfferTypes, setAllOfferTypes] = useState<string[]>([]);

  // Loading states
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [offerTypesLoading, setOfferTypesLoading] = useState(true);

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLocationFilter = useDebounce(locationFilter, 500);
  const debouncedCompanySearch = useDebounce(companySearch, 500);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setSkillsLoading(true);
        const skillsData = await getAllSkills();
        setAllSkills(Array.isArray(skillsData) ? skillsData : []);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchFilterData();
  }, []);



  useEffect(() => {
    const fetchOfferTypes = async () => {
      try {
        setOfferTypesLoading(true);
        const typesData = await getOfferTypes();
        setAllOfferTypes(Array.isArray(typesData) ? typesData : []);
      } catch (error) {
        console.error("Failed to fetch offer types", error);
      } finally {
        setOfferTypesLoading(false);
      }
    };

    fetchOfferTypes();
  }, []);

  // Handle skill selection
  const handleSkillChange = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  // Clear all skills
  const clearAllSkills = () => {
    setSelectedSkills([]);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCompanySearch('');
    setSelectedType('');
    setSelectedSkills([]);
  };

  return {
    filters: {
      searchTerm,
      locationFilter,
      companySearch,
      selectedType,
      selectedSkills,
    },
    debouncedFilters: {
      search: debouncedSearchTerm,
      location: debouncedLocationFilter,
      companyName: debouncedCompanySearch,
      type: selectedType, // Type filter should be applied immediately, no debouncing needed
      skills: selectedSkills,
    },
    allSkills,
    allOfferTypes,
    skillsLoading,
    offerTypesLoading,
    setSearchTerm,
    setLocationFilter,
    setCompanySearch,
    setSelectedType,
    setSelectedSkills,
    handleSkillChange,
    clearAllSkills,
    clearFilters,
  };
};
