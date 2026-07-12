import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: attach token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Prevent browser caching for GET requests
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 and 404 ──
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dc_token');
      localStorage.removeItem('dc_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 404 && error.response?.data?.detail === 'Session not found') {
      localStorage.removeItem('dc_session');
      localStorage.removeItem('dc_dataset_info');
      if (window.location.pathname !== '/upload') {
        window.location.href = '/upload';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// ── Upload ──
export const upload = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },
  loadSampleData: () => api.post('/sample-data'),
};

// ── Preview ──
export const preview = {
  getPreview: (sessionId, type = 'cleaned', page = 1, pageSize = 50) =>
    api.get(`/preview/${sessionId}`, { params: { type, page, page_size: pageSize } }),
  getColumnStats: (sessionId, type = 'cleaned') =>
    api.get(`/preview/${sessionId}/columns`, { params: { type } }),
};

// ── Cleaning ──
export const cleaning = {
  getSummary: (sessionId) =>
    api.get(`/cleaning/${sessionId}/summary`),
  autoClean: (sessionId) =>
    api.post(`/cleaning/${sessionId}/auto`),
  applyOperations: (sessionId, operations) =>
    api.post(`/cleaning/${sessionId}/apply`, { operations }),
};

// ── Outliers ──
export const outliers = {
  detect: (sessionId, column, method = 'iqr', threshold = 1.5) =>
    api.post(`/outliers/${sessionId}/detect`, { column, method, threshold }),
  remove: (sessionId, column, method = 'iqr', threshold = 1.5) =>
    api.post(`/outliers/${sessionId}/remove`, { column, method, threshold }),
};

// ── Visualization ──
export const visualization = {
  generateChart: (sessionId, chartConfig) =>
    api.post(`/visualize/${sessionId}`, chartConfig),
};

// ── Statistics ──
export const statistics = {
  getStatistics: (sessionId) =>
    api.get(`/statistics/${sessionId}`),
};

// ── AI Insights ──
export const insights = {
  getInsights: (sessionId) =>
    api.get(`/insights/${sessionId}`),
};

// ── Reports ──
export const reports = {
  generateReport: (sessionId, format = 'html', sections = []) =>
    api.post(`/reports/${sessionId}/generate`, { format, sections }, {
      responseType: format === 'pdf' ? 'blob' : 'json',
    }),
};

// ── Downloads ──
export const download = {
  downloadCSV: (sessionId) =>
    api.get(`/download/${sessionId}/csv`, { responseType: 'blob' }),
  downloadExcel: (sessionId) =>
    api.get(`/download/${sessionId}/excel`, { responseType: 'blob' }),
  downloadChart: (sessionId, chartConfig) =>
    api.post(`/download/${sessionId}/chart`, chartConfig, { responseType: 'blob' }),
};

export default api;
