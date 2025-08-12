import apiClient from './apiClient';

export const createAdoptionRequest = async (studentId: string, message: string, offerId?: string) => {
  try {
    const { data } = await apiClient.post('/adoption-requests', { studentId, message, offerId });
    return data;
  } catch (error: any) {
    // Provide more specific error messages
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 'Invalid request data';
      throw new Error(errorMessage);
    } else if (error.response?.status === 409) {
      throw new Error('You have already sent this adoption request');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('Failed to send adoption request. Please check your connection and try again.');
    }
  }
};

export const getSentAdoptionRequests = async () => {
  const { data } = await apiClient.get('/adoption-requests/sent-requests');
  // API returns { requests: [...], pagination: {...} }
  return data.requests || [];
}

// If offerId is provided, returns student IDs requested for that specific offer.
// If omitted, returns student IDs for general requests only (offerId null).
export const getRequestedStudentIds = async (offerId?: string): Promise<string[]> => {
  try {
    const requests = await getSentAdoptionRequests();
    const filtered = requests.filter((request: any) => {
      if (offerId) {
        return request.offerId === offerId;
      }
      return !request.offerId;
    });
    return filtered.map((request: any) => request.studentId);
  } catch (error) {
    console.error('Failed to fetch sent adoption requests:', error);
    return [];
  }
}

export const getMyAdoptionRequests = async () => {
    const { data } = await apiClient.get('/adoption-requests/my-requests');
    // API returns { requests: [...], pagination: {...} }
    return data.requests || [];
}

export const updateAdoptionRequestStatus = async (id: string, status: string) => {
    const { data } = await apiClient.patch(`/adoption-requests/${id}/status`, { status });
    return data;
} 