import apiClient from './apiClient';



export const getAllSkills = async () => {
  const { data } = await apiClient.get('/skills');
  return data;
};