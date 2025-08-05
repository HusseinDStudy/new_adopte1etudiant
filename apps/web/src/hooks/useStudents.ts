import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { listAvailableStudents } from '../services/studentService';
import { getAllSkills } from '../services/skillService';
import { createAdoptionRequest, getRequestedStudentIds } from '../services/adoptionRequestService';

export interface Student {
  id: string; // User ID for adoption requests
  profileId: string; // Student profile ID
  firstName: string;
  lastName: string;
  email: string;
  school: string | null;
  degree: string | null;
  location: string | null;
  skills: string[]; // API returns skills as array of strings
  cvUrl: string | null;
  isCvPublic: boolean;
  createdAt?: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface StudentFilters {
  search: string;
  location: string;
  school: string;
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
  clearAllSkills: () => void;
  clearFilters: () => void;
  refetch: () => void;

  // Adoption request functionality
  sendAdoptionRequest: (studentId: string, message: string) => Promise<void>;
  adoptionRequestLoading: boolean;
  requestedStudentIds: Set<string>;
  setRequestedStudentIds: (ids: Set<string>) => void;
  refreshRequestedStudents: () => Promise<void>;
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
  const [requestedStudentIds, setRequestedStudentIds] = useState<Set<string>>(new Set());

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch students based on filters
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: debouncedSearchTerm,
        location: '',
        school: '',
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

  // Fetch requested student IDs
  const refreshRequestedStudents = async () => {
    try {
      const requestedIds = await getRequestedStudentIds();
      setRequestedStudentIds(new Set(requestedIds));
    } catch (err) {
      console.error('Failed to fetch requested student IDs:', err);
    }
  };

  // Fetch skills for filter options and requested students
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
    refreshRequestedStudents();
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

  // Clear all skills
  const clearAllSkills = () => {
    setSelectedSkills([]);
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
      // Add to requested students list on success
      setRequestedStudentIds(prev => new Set(prev).add(studentId));
    } catch (err: any) {
      console.error('Failed to send adoption request:', err);
      // If it's a 409 error (already requested), update our local state
      if (err.message?.includes('already sent')) {
        setRequestedStudentIds(prev => new Set(prev).add(studentId));
      }
      // Re-throw the error with the specific message from the service
      throw new Error(err.message || 'Failed to send adoption request');
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
      location: '',
      school: '',
      skills: selectedSkills,
    },
    setSearchTerm,
    setSelectedSkills,
    handleSkillChange,
    clearAllSkills,
    clearFilters,
    refetch,
    sendAdoptionRequest,
    adoptionRequestLoading,
    requestedStudentIds,
    setRequestedStudentIds,
    refreshRequestedStudents,
  };
};
