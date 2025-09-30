import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

export const packagesAPI = {
  getAll: () => api.get('/api/packages/'),
  getById: (id: number) => api.get(`/api/packages/${id}`),
};

export const paymentsAPI = {
  createOrder: (packageId: number) => api.post('/api/payments/create-order', { package_id: packageId }),
  verifyPayment: (data: any) => api.post('/api/payments/verify', data),
  getMyPayments: () => api.get('/api/payments/my-payments'),
};

export const referralsAPI = {
  getMyReferrals: () => api.get('/api/referrals/my-referrals'),
  getTree: () => api.get('/api/referrals/tree'),
  getStats: () => api.get('/api/referrals/stats'),
};

export const commissionsAPI = {
  getMyCommissions: (status?: string) => 
    api.get('/api/commissions/my-commissions', { params: { status_filter: status } }),
  getSummary: () => api.get('/api/commissions/summary'),
};

export const coursesAPI = {
  getAll: () => api.get('/api/courses/'),
  getById: (id: number) => api.get(`/api/courses/${id}`),
  getVideo: (courseId: number, videoId: number) => 
    api.get(`/api/courses/${courseId}/videos/${videoId}`),
};

export const payoutsAPI = {
  getMyPayouts: () => api.get('/api/payouts/my-payouts'),
  getPendingAmount: () => api.get('/api/payouts/my-pending-amount'),
  requestPayout: (data: any) => api.post('/api/payouts/request', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (skip?: number, limit?: number) => 
    api.get('/api/admin/users', { params: { skip, limit } }),
  toggleUserActive: (userId: number) => api.put(`/api/admin/users/${userId}/toggle-active`),
  toggleUserAdmin: (userId: number) => api.put(`/api/admin/users/${userId}/toggle-admin`),
  getRecentActivity: () => api.get('/api/admin/recent-activity'),
};

