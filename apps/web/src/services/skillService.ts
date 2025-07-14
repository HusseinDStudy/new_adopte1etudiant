import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;// || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getAllSkills = async () => {
    const { data } = await apiClient.get('/skills');
    return data;
}