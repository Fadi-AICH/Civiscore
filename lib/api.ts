import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_PATH = '/api/v1';

const api = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services API
export const servicesApi = {
  // Get all services with optional filters
  getServices: async (params = {}) => {
    const response = await api.get('/services/', { params });
    return response.data;
  },

  // Get a single service by ID
  getService: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Get nearby services based on location
  getNearbyServices: async (latitude: number, longitude: number, radius: number = 5000) => {
    const response = await api.get('/services/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  },

  // Enrich a service with Google Places data
  enrichService: async (serviceId: string) => {
    const response = await api.post(`/services/${serviceId}/enrich`);
    return response.data;
  },

  // Import a service from Google Places
  importFromPlaces: async (placeId: string, countryId: string) => {
    const response = await api.post('/services/import-from-places', {
      place_id: placeId,
      country_id: countryId
    });
    return response.data;
  }
};

// Evaluations API
export const evaluationsApi = {
  // Get evaluations for a service
  getServiceEvaluations: async (serviceId: string) => {
    const response = await api.get(`/evaluations/${serviceId}/list`);
    return response.data;
  },

  // Create a new evaluation
  createEvaluation: async (data: any) => {
    const response = await api.post('/evaluations/', data);
    return response.data;
  }
};

export default api;
