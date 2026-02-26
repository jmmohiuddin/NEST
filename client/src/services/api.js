import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('neest_token');
      localStorage.removeItem('neest_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  firebaseLogin: (data) => api.post('/auth/firebase-login', data),
  firebaseRegister: (data) => api.post('/auth/firebase-register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Startups API
export const startupsAPI = {
  getAll: (params) => api.get('/startups', { params }),
  getOne: (idOrSlug) => api.get(`/startups/${idOrSlug}`),
  create: (data) => api.post('/startups', data),
  update: (id, data) => api.put(`/startups/${id}`, data),
  delete: (id) => api.delete(`/startups/${id}`),
  getMine: () => api.get('/startups/my/startup'),
  getStats: () => api.get('/startups/stats/overview'),
};

// Mentors API
export const mentorsAPI = {
  getAll: (params) => api.get('/mentors', { params }),
  getOne: (id) => api.get(`/mentors/${id}`),
  create: (data) => api.post('/mentors', data),
  createProfile: (data) => api.post('/mentors', data),
  update: (id, data) => api.put(`/mentors/${id}`, data),
  updateProfile: (data) => api.put('/mentors/profile', data),
  getMine: () => api.get('/mentors/my/profile'),
  getMyProfile: () => api.get('/mentors/my/profile'),
  review: (id, data) => api.post(`/mentors/${id}/review`, data),
  getStats: () => api.get('/mentors/stats/overview'),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (idOrSlug) => api.get(`/events/${idOrSlug}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  cancelRegistration: (id) => api.delete(`/events/${id}/register`),
  getMyRegistered: () => api.get('/events/my/registered'),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDashboardStats: () => api.get('/admin/stats'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getPending: () => api.get('/admin/pending'),
  getPendingApprovals: () => api.get('/admin/pending'),
  updateStartupStatus: (id, data) => api.put(`/admin/startups/${id}/status`, data),
  updateMentorStatus: (id, data) => api.put(`/admin/mentors/${id}/status`, data),
};

// Matchmaking API
export const matchmakingAPI = {
  getMentorsForStartup: (startupId) => api.get(`/matchmaking/mentors-for-startup/${startupId}`),
  getStartupsForMentor: (mentorId) => api.get(`/matchmaking/startups-for-mentor/${mentorId}`),
};

export default api;
