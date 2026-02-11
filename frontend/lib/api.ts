import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ Auth API ============
export const authAPI = {
  register: async (data: { email: string; password: string; full_name?: string; phone?: string }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// ============ Safety API ============
export const safetyAPI = {
  check: async (data: { latitude: number; longitude: number; altitude?: number }) => {
    const response = await api.post('/api/safety/check', data);
    return response.data;
  },
};

// ============ Reports API ============
export const reportsAPI = {
  submit: async (data: {
    latitude: number;
    longitude: number;
    altitude?: number;
    category: string;
    description: string;
    photo_url?: string;
  }) => {
    const response = await api.post('/api/reports/submit', data);
    return response.data;
  },

  getAll: async (params?: { category?: string; status?: string; limit?: number }) => {
    const response = await api.get('/api/reports/all', { params });
    return response.data;
  },

  getMyReports: async () => {
    const response = await api.get('/api/reports/my-reports');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/reports/stats');
    return response.data;
  },
};

// ============ Predictions API ============
export const predictAPI = {
  flood: async (data: { latitude: number; longitude: number; rainfall_mm?: number }) => {
    const response = await api.post('/api/predict/flood', data);
    return response.data;
  },

  heatmap: async (zone?: string) => {
    const response = await api.get('/api/predict/heatmap', { params: { zone } });
    return response.data;
  },

  simulate: async (data: { zone: string; water_level_rise: number }) => {
    const response = await api.post('/api/predict/simulate', data);
    return response.data;
  },
};

// ============ Zones API ============
export const zonesAPI = {
  atLocation: async (data: { latitude: number; longitude: number }) => {
    const response = await api.post('/api/zones/at-location', data);
    return response.data;
  },

  classify: async (data: { latitude: number; longitude: number }) => {
    const response = await api.post('/api/zones/classify', data);
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/api/zones/summary');
    return response.data;
  },
};

// ============ Evacuation API ============
export const evacuationAPI = {
  getShelters: async (params?: { latitude?: number; longitude?: number; radius_km?: number }) => {
    const response = await api.get('/api/evacuation/shelters', { params });
    return response.data;
  },

  getRoute: async (data: {
    start_lat: number;
    start_lng: number;
    end_lat?: number;
    end_lng?: number;
    preference?: 'fastest' | 'safest' | 'shortest';
  }) => {
    const response = await api.post('/api/evacuation/route', data);
    return response.data;
  },
};

// ============ Health API ============
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
