import axios from 'axios';

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8000';

const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

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
      // Clear stale token. UI can decide how to handle unauthenticated state.
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
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

  getAll: async (params?: { category?: string; status?: string; limit?: number; offset?: number }) => {
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

  updateStatus: async (reportId: number, data: { status: string; notes?: string }) => {
    const response = await api.patch(`/api/reports/${reportId}/status`, data);
    return response.data;
  },
};

// ============ Chat API ============
export const chatAPI = {
  send: async (data: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) => {
    const response = await api.post('/api/chat/chat', data);
    return response.data as {
      response: string;
      reply?: string;
      context_used?: boolean;
      error?: boolean;
    };
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
  getShelters: async (latitude: number, longitude: number, radius_km = 50) => {
    const response = await api.get('/api/evacuation/shelters', {
      params: { latitude, longitude, radius_km },
    });
    return response.data;
  },

  getRoute: async (data: {
    start_lat: number;
    start_lng: number;
    end_lat: number;
    end_lng: number;
    preference?: 'fastest' | 'safest' | 'shortest';
  }) => {
    const response = await api.post('/api/evacuation/route', data);
    return response.data;
  },

  getRouteToShelter: async (latitude: number, longitude: number, preference: 'fastest' | 'safest' | 'shortest' = 'fastest') => {
    const response = await api.post('/api/evacuation/route-to-shelter', {
      latitude,
      longitude,
      preference,
    });
    return response.data;
  },
};

// ============ Emergency API ============
export const emergencyAPI = {
  /** One-click: sends WhatsApp alerts to pre-configured emergency contacts */
  activate: async (data?: { message?: string; severity?: string }) => {
    const response = await api.post('/api/emergency/activate', data || {});
    return response.data;
  },

  /** Get configured emergency contacts */
  getContacts: async () => {
    const response = await api.get('/api/emergency/contacts');
    return response.data;
  },
};

// ============ Alerts API ============
export const alertsAPI = {
  sendSMS: async (data: { message: string; severity: 'info' | 'warning' | 'critical' | 'emergency'; region?: string }) => {
    const response = await api.post('/api/alerts/send-sms', data);
    return response.data;
  },

  history: async (severity?: 'info' | 'warning' | 'critical' | 'emergency') => {
    const response = await api.get('/api/alerts/history', { params: { severity } });
    return response.data;
  },

  recipientsCount: async () => {
    const response = await api.get('/api/alerts/recipients-count');
    return response.data as { count: number };
  },

  broadcastCall: async (data: { message: string; language: 'hi-IN' | 'en-IN'; region?: string }) => {
    const response = await api.post('/api/alerts/broadcast-call', data);
    return response.data;
  },
};

// ============ NGO API ============
export const ngoAPI = {
  createTask: async (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    task_type: 'cleanup' | 'relief' | 'survey' | 'monitoring';
  }) => {
    const response = await api.post('/api/ngo/tasks', data);
    return response.data;
  },

  getAllTasks: async (status?: string) => {
    const response = await api.get('/api/ngo/tasks', { params: { status } });
    return response.data;
  },

  getMyTasks: async () => {
    const response = await api.get('/api/ngo/my-tasks');
    return response.data;
  },

  startTask: async (taskId: number) => {
    const response = await api.patch(`/api/ngo/tasks/${taskId}/start`);
    return response.data;
  },

  completeTask: async (taskId: number, proof_photo_url: string) => {
    const response = await api.patch(`/api/ngo/tasks/${taskId}/complete`, { proof_photo_url });
    return response.data;
  },

  verifyTask: async (taskId: number, verification_score: number, points_awarded: number) => {
    const response = await api.patch(`/api/ngo/tasks/${taskId}/verify`, {
      verification_score,
      points_awarded,
    });
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/api/ngo/leaderboard');
    return response.data;
  },
};

// ============ PPP API ============
export const pppAPI = {
  estimateLoss: async (data: {
    latitude: number;
    longitude: number;
    radius_km?: number;
    rainfall_mm?: number;
  }) => {
    const response = await api.post('/api/ppp/estimate-loss', data);
    return response.data;
  },

  compare: async (data: {
    latitude: number;
    longitude: number;
    radius_km?: number;
    rainfall_mm?: number;
    infrastructure_type: string;
    infrastructure_params?: Record<string, number>;
  }) => {
    const response = await api.post('/api/ppp/compare', data);
    return response.data;
  },

  getInfrastructureOptions: async () => {
    const response = await api.get('/api/ppp/infrastructure-options');
    return response.data;
  },

  similarityMatch: async (data: {
    latitude: number;
    longitude: number;
    predicted_depth_m: number;
    rainfall_mm?: number;
  }) => {
    const response = await api.post('/api/ppp/similarity-match', data);
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

// ============ Researcher API ============
export const researcherAPI = {
  getDatasets: async (params?: { category?: string }) => {
    const response = await api.get('/api/data/datasets', { params });
    return response.data;
  },

  getDatasetDetail: async (datasetId: string) => {
    const response = await api.get(`/api/data/datasets/${datasetId}`);
    return response.data;
  },

  getModelRegistry: async () => {
    const response = await api.get('/api/models/registry');
    return response.data;
  },

  getModelDetail: async (modelId: string) => {
    const response = await api.get(`/api/models/registry/${modelId}`);
    return response.data;
  },

  runPrediction: async (data: {
    latitude: number;
    longitude: number;
    rainfall_mm?: number;
    model_id?: string;
  }) => {
    const response = await api.post('/api/models/predict', data);
    return response.data;
  },

  getResearcherStats: async () => {
    const response = await api.get('/api/data/researcher-stats');
    return response.data;
  },
};

// ============ API Docs API ============
export const apiDocsAPI = {
  getCatalog: async () => {
    const response = await api.get('/api/api-docs/catalog');
    return response.data;
  },
};

// ============ Insights API ============
export const insightsAPI = {
  getReportTrends: async () => {
    const response = await api.get('/api/insights/report-trends');
    return response.data;
  },

  getCategoryDistribution: async () => {
    const response = await api.get('/api/insights/category-distribution');
    return response.data;
  },

  getVerificationStats: async () => {
    const response = await api.get('/api/insights/verification-stats');
    return response.data;
  },

  getStatusBreakdown: async () => {
    const response = await api.get('/api/insights/status-breakdown');
    return response.data;
  },

  getCuratedInsights: async () => {
    const response = await api.get('/api/insights/curated-insights');
    return response.data;
  },

  getRegionalSummary: async () => {
    const response = await api.get('/api/insights/regional-summary');
    return response.data;
  },
};

export default api;
