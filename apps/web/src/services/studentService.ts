import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;// || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const listAvailableStudents = async (filters: { search?: string, skills?: string[] } = {}) => {
  const { data } = await apiClient.get('/students', {
    params: {
      search: filters.search,
      skills: filters.skills?.join(','),
    }
  });
  return data;
};

export const getStudentProfile = async () => {
  const { data } = await apiClient.get('/profile/student');
  return data;
}; 