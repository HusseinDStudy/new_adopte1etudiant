import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { getAllSkills } from '../services/skillService';
import { getCompaniesWithOffers } from '../services/companyService';

export interface Skill {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface FilterState {
  searchTerm: string;
  locationFilter: string;
  selectedCompany: string;
  selectedSkills: string[];
}

export interface DebouncedFilters {
  search: string;
  location: string;
  companyName: string;
  skills: string[];
}

export interface UseOfferFiltersResult {
  // Filter state
  filters: FilterState;
  
  // Debounced values for API calls
  debouncedFilters: DebouncedFilters;
  
  // Filter options
  allSkills: Skill[];
  allCompanies: Company[];
  
  // Loading states
  skillsLoading: boolean;
  companiesLoading: boolean;
  
  // Actions
  setSearchTerm: (value: string) => void;
  setLocationFilter: (value: string) => void;
  setSelectedCompany: (value: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  handleSkillChange: (skillName: string) => void;
  clearFilters: () => void;
}

export const useOfferFilters = (): UseOfferFiltersResult => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Filter options
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  
  // Loading states
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLocationFilter = useDebounce(locationFilter, 500);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setSkillsLoading(true);
        const skillsData = await getAllSkills();
        setAllSkills(skillsData);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const companiesData = await getCompaniesWithOffers();
        setAllCompanies(companiesData);
      } catch (error) {
        console.error("Failed to fetch companies", error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Handle skill selection
  const handleSkillChange = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setSelectedCompany('');
    setSelectedSkills([]);
  };

  return {
    filters: {
      searchTerm,
      locationFilter,
      selectedCompany,
      selectedSkills,
    },
    debouncedFilters: {
      search: debouncedSearchTerm,
      location: debouncedLocationFilter,
      companyName: selectedCompany,
      skills: selectedSkills,
    },
    allSkills,
    allCompanies,
    skillsLoading,
    companiesLoading,
    setSearchTerm,
    setLocationFilter,
    setSelectedCompany,
    setSelectedSkills,
    handleSkillChange,
    clearFilters,
  };
};
