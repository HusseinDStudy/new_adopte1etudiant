import apiClient from './apiClient';

export const getCompaniesWithOffers = async () => {
    const { data } = await apiClient.get('/companies');
    return data;
}