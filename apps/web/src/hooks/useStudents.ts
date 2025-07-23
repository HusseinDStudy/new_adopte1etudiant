import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { listAvailableStudents } from '../services/studentService';
import { getAllSkills } from '../services/skillService';
import { createAdoptionRequest } from '../services/adoptionRequestService';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string | null;
  degree: string | null;
  skills: {
    id: string;
    name: string;
  }[];
  cvUrl: string | null;
  isCvPublic: boolean;
}

export interface Skill {
  id: string;
  name: string;
}

export interface StudentFilters {
  search: string;
  skills: string[];
}

export interface UseStudentsResult {
  // Student data
  students: Student[];
  loading: boolean;
  error: string | null;
  
  // Filter state
  searchTerm: string;
  selectedSkills: string[];
  allSkills: Skill[];
  skillsLoading: boolean;
  
  // Debounced filters for API calls
  debouncedFilters: StudentFilters;
  
  // Actions
  setSearchTerm: (value: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  handleSkillChange: (skillName: string) => void;
  clearFilters: () => void;
  refetch: () => void;
  
  // Adoption request functionality
  sendAdoptionRequest: (studentId: string, message: string) => Promise<void>;
  adoptionRequestLoading: boolean;
}

export const useStudents = (): UseStudentsResult => {
  // Student data
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  
  // Adoption request state
  const [adoptionRequestLoading, setAdoptionRequestLoading] = useState(false);

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch students based on filters
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: debouncedSearchTerm,
        skills: selectedSkills,
      };
      
      const data = await listAvailableStudents(filters);
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch skills for filter options
  useEffect(() => {
    const fetchSkills = async () => {
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

    fetchSkills();
  }, []);

  // Fetch students when filters change
  useEffect(() => {
    fetchStudents();
  }, [debouncedSearchTerm, selectedSkills]);

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
    setSelectedSkills([]);
  };

  // Send adoption request
  const sendAdoptionRequest = async (studentId: string, message: string) => {
    setAdoptionRequestLoading(true);
    try {
      await createAdoptionRequest(studentId, message);
    } catch (err) {
      console.error('Failed to send adoption request:', err);
      throw err; // Re-throw so the component can handle it
    } finally {
      setAdoptionRequestLoading(false);
    }
  };

  const refetch = () => {
    fetchStudents();
  };

  return {
    students,
    loading,
    error,
    searchTerm,
    selectedSkills,
    allSkills,
    skillsLoading,
    debouncedFilters: {
      search: debouncedSearchTerm,
      skills: selectedSkills,
    },
    setSearchTerm,
    setSelectedSkills,
    handleSkillChange,
    clearFilters,
    refetch,
    sendAdoptionRequest,
    adoptionRequestLoading,
  };
};
