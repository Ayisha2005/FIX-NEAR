import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homeserve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('homeserve_token');
      localStorage.removeItem('homeserve_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

export const servicesApi = {
  getCategories: () => API.get('/services/categories'),
};

export const providersApi = {
  search: (params) => API.get('/providers', { params }),
  getById: (id) => API.get(`/providers/${id}`),
  updateProfile: (data) => API.put('/providers/profile', data),
};

export const bookingsApi = {
  create: (bookingData) => API.post('/bookings', bookingData),
  list: () => API.get('/bookings'),
  updateStatus: (id, status) => API.put(`/bookings/${id}/status`, { status }),
  addReview: (id, reviewData) => API.post(`/bookings/${id}/reviews`, reviewData),
};

export const contactsApi = {
  unlock: (providerId) => API.post('/contacts/unlock', { provider_id: providerId }),
  getUnlocked: () => API.get('/contacts/unlocked'),
};

export const premiumApi = {
  subscribe: (planName) => API.post('/premium/subscribe', { plan_name: planName }),
  getStatus: () => API.get('/premium/status'),
};

export const adminApi = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (role) => API.get('/admin/users', { params: { role } }),
  toggleUserPremium: (id) => API.put(`/admin/users/${id}/toggle-premium`),
};

export default API;
