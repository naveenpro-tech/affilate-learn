import axios from 'axios';

// Use localhost for development, production URL for production
const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://affilate-learn.onrender.com');

// Debug: Log the API URL being used
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_URL: API_URL,
    hostname: window.location.hostname,
    environment: process.env.NODE_ENV
  });
}

// Create axios instance with no-cache headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
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

    // Normalize error message to avoid passing objects to UI toasts
    const data = error.response?.data;
    let message: string = 'Request failed';

    if (typeof data === 'string') {
      message = data;
    } else if (data?.detail) {
      // FastAPI error convention
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic validation error array
        message = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      } else if (typeof data.detail === 'object') {
        message = data.detail.msg || JSON.stringify(data.detail);
      }
    } else if (data?.message) {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Attach a safe string message
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', null, {
      params: { current_password: currentPassword, new_password: newPassword }
    }),
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', null, {
      params: { email }
    }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/api/auth/reset-password', null, {
      params: { token, new_password: newPassword }
    }),
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
  getTopEarners: (limit?: number) =>
    api.get('/api/commissions/top-earners', { params: { limit: limit || 10 } }),
};

export const coursesAPI = {
  getAll: () => api.get('/api/courses/'),
  getAllWithAccess: () => api.get('/api/courses/all-with-access'),
  getById: (id: number) => api.get(`/api/courses/${id}`),
  getWithModules: (id: number) => api.get(`/api/courses/${id}/with-modules`),
  getVideo: (courseId: number, videoId: number) =>
    api.get(`/api/courses/${courseId}/videos/${videoId}`),
  getVideoProgress: (courseId: number, videoId: number) =>
    api.get(`/api/courses/${courseId}/videos/${videoId}/progress`),
  setVideoProgress: (courseId: number, videoId: number, watchedSeconds: number, completed = false) =>
    api.post(`/api/courses/${courseId}/videos/${videoId}/progress`, { watched_seconds: watchedSeconds, completed }),
  issueCertificate: (courseId: number) => api.post(`/api/courses/${courseId}/certificate/issue`),
};

export const coursePurchasesAPI = {
  initiate: (courseId: number, paymentMethod = 'razorpay') =>
    api.post('/api/course-purchases/initiate', { course_id: courseId, payment_method: paymentMethod }),
  verify: (orderId: string, paymentId: string, signature: string, courseId: number) =>
    api.post('/api/course-purchases/verify', null, {
      params: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        course_id: courseId
      }
    }),
  getMyPurchases: () => api.get('/api/course-purchases/my-purchases'),
  checkAccess: (courseId: number) => api.get(`/api/course-purchases/check-access/${courseId}`),
};
export const profileAPI = {
  getMe: () => api.get('/api/profile/me'),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};


export const payoutsAPI = {
  getMyPayouts: () => api.get('/api/payouts/my-payouts'),
  getPendingAmount: () => api.get('/api/payouts/my-pending-amount'),
  getAvailableBalance: () => api.get('/api/payouts/available-balance'),
  requestPayout: (data: any) => api.post('/api/payouts/request', data),
  getHistory: () => api.get('/api/payouts/my-payouts'),
};

export const bankDetailsAPI = {
  get: () => api.get('/api/bank-details/'),
  create: (data: any) => api.post('/api/bank-details/', data),
  update: (data: any) => api.put('/api/bank-details/', data),
  delete: () => api.delete('/api/bank-details/'),
};

export const certificatesAPI = {
  getMyCertificates: () => api.get('/api/certificates/my-certificates'),
  getCertificate: (id: number) => api.get(`/api/certificates/${id}`),
  verifyCertificate: (certificateNumber: string) => api.get(`/api/certificates/verify/${certificateNumber}`),
  generateCertificate: (courseId: number) => api.post(`/api/courses/${courseId}/certificate/issue`),
};

export const emailVerificationAPI = {
  sendVerification: () => api.post('/api/email-verification/send-verification'),
  verifyEmail: (token: string) => api.post('/api/email-verification/verify', { token }),
  getStatus: () => api.get('/api/email-verification/status'),
  resendVerification: () => api.post('/api/email-verification/resend'),
};

export const notificationsAPI = {
  getAll: (skip = 0, limit = 50, unreadOnly = false) =>
    api.get('/api/notifications/', { params: { skip, limit, unread_only: unreadOnly } }),
  getStats: () => api.get('/api/notifications/stats'),
  getById: (id: number) => api.get(`/api/notifications/${id}`),
  markAsRead: (id: number) => api.patch(`/api/notifications/${id}/read`),
  markAsUnread: (id: number) => api.patch(`/api/notifications/${id}/unread`),
  markAllAsRead: () => api.post('/api/notifications/mark-all-read'),
  delete: (id: number) => api.delete(`/api/notifications/${id}`),
  create: (data: any) => api.post('/api/notifications/create', data),
};

export const walletAPI = {
  getWallet: () => api.get('/api/wallet/'),
  getStats: () => api.get('/api/wallet/stats'),
  getTransactions: (skip = 0, limit = 50) =>
    api.get('/api/wallet/transactions', { params: { skip, limit } }),
  getWithTransactions: (limit = 10) =>
    api.get('/api/wallet/with-transactions', { params: { limit } }),
  credit: (amount: number, description: string, source = 'admin', referenceId?: string) =>
    api.post('/api/wallet/credit', null, {
      params: { amount, description, source, reference_id: referenceId }
    }),
  debit: (amount: number, description: string, source = 'purchase', referenceId?: string) =>
    api.post('/api/wallet/debit', null, {
      params: { amount, description, source, reference_id: referenceId }
    }),
  withdraw: (amount: number) =>
    api.post('/api/wallet/withdraw', null, { params: { amount } }),
};

// Admin API endpoints
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/api/admin/dashboard'),
  getRecentActivity: () => api.get('/api/admin/recent-activity'),

  // Users
  getUsers: (skip = 0, limit = 100) => api.get(`/api/admin/users?skip=${skip}&limit=${limit}`),
  toggleUserActive: (userId: number) => api.put(`/api/admin/users/${userId}/toggle-active`),
  toggleUserAdmin: (userId: number) => api.put(`/api/admin/users/${userId}/toggle-admin`),

  // Courses (using /api/courses endpoints with admin auth)
  getCourses: () => api.get('/api/courses/'),
  createCourse: (data: any) => api.post('/api/courses/', data),
  updateCourse: (courseId: number, data: any) => api.put(`/api/courses/${courseId}`, data),
  deleteCourse: (courseId: number) => api.delete(`/api/courses/${courseId}`),

  // Videos
  uploadVideo: (courseId: number, formData: FormData) =>
    api.post(`/api/courses/${courseId}/videos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateVideo: (courseId: number, videoId: number, data: any) =>
    api.put(`/api/courses/${courseId}/videos/${videoId}`, data),
  deleteVideo: (courseId: number, videoId: number) =>
    api.delete(`/api/courses/${courseId}/videos/${videoId}`),

  // Payouts (Admin)
  getPendingPayouts: () => api.get('/api/payouts/all', { params: { status_filter: 'pending', limit: 100 } }),
  getAllPayouts: (limit = 100) => api.get('/api/payouts/all', { params: { limit } }),
  approvePayout: (payoutId: number) => api.put(`/api/payouts/${payoutId}/approve`),
  rejectPayout: (payoutId: number, reason?: string) => api.put(`/api/payouts/${payoutId}/cancel`, null, { params: { reason } }),
  completePayout: (payoutId: number, transactionId?: string) => api.put(`/api/payouts/${payoutId}/process`, { transaction_id: transactionId }),

  // Modules & Topics (Admin)
  createModule: (data: any) => api.post('/api/modules/', data),
  getModule: (moduleId: number) => api.get(`/api/modules/${moduleId}`),
  updateModule: (moduleId: number, data: any) => api.put(`/api/modules/${moduleId}`, data),
  deleteModule: (moduleId: number) => api.delete(`/api/modules/${moduleId}`),

  createTopic: (moduleId: number, data: any) => api.post(`/api/modules/${moduleId}/topics`, data),
  uploadTopicVideo: (moduleId: number, formData: FormData) =>
    api.post(`/api/modules/${moduleId}/topics/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getTopic: (moduleId: number, topicId: number) => api.get(`/api/modules/${moduleId}/topics/${topicId}`),
  updateTopic: (moduleId: number, topicId: number, data: any) => api.put(`/api/modules/${moduleId}/topics/${topicId}`, data),
  deleteTopic: (moduleId: number, topicId: number) => api.delete(`/api/modules/${moduleId}/topics/${topicId}`),

  // Studio Moderation (Phase 3)
  getModerationReports: (statusFilter?: string, skip: number = 0, limit: number = 50) =>
    api.get('/api/admin/studio/moderation/reports', { params: { status_filter: statusFilter, skip, limit } }),
  getModerationStats: () => api.get('/api/admin/studio/moderation/stats'),
  hidePost: (postId: number) => api.post(`/api/admin/studio/moderation/posts/${postId}/hide`),
  unhidePost: (postId: number) => api.post(`/api/admin/studio/moderation/posts/${postId}/unhide`),
  deletePost: (postId: number) => api.delete(`/api/admin/studio/moderation/posts/${postId}`),
  resolveReport: (reportId: number, actionTaken: string, notes?: string) =>
    api.put(`/api/admin/studio/moderation/reports/${reportId}/resolve`, null, { params: { action_taken: actionTaken, notes } }),
  closeReport: (reportId: number) => api.put(`/api/admin/studio/moderation/reports/${reportId}/close`),
};

// Video Progress API
export const videoProgressAPI = {
  updateProgress: (data: any) => api.post('/api/video-progress/update', data),
  getTopicProgress: (topicId: number) => api.get(`/api/video-progress/topic/${topicId}`),
  getCourseProgress: (courseId: number) => api.get(`/api/video-progress/course/${courseId}`),
  getMyProgress: () => api.get('/api/video-progress/my-progress'),
  markComplete: (topicId: number) => api.post(`/api/video-progress/mark-complete/${topicId}`),
};

// Community AI Studio API
export const studioAPI = {
  // Templates & Categories
  getCategories: () => api.get('/api/studio/categories'),
  getTemplates: (categoryId?: number) =>
    api.get('/api/studio/templates', { params: categoryId ? { category_id: categoryId } : {} }),
  getTemplate: (templateId: number) =>
    api.get(`/api/studio/templates/${templateId}`),

  // Prompt Enhancement
  enhancePrompt: (prompt: string) =>
    api.post('/api/studio/enhance-prompt', { prompt }),

  // Image Generation
  generateImage: (
    prompt: string,
    tier: string = 'standard',
    templateId?: number,
    watermark: boolean = true,
    enhancePrompt: boolean = false,
    provider?: string
  ) =>
    api.post('/api/studio/generate', {
      prompt,
      tier,
      template_id: templateId,
      watermark,
      enhance_prompt: enhancePrompt,
      provider,
    }),

  // Check generation status
  getGenerationStatus: (jobId: string) =>
    api.get(`/api/studio/generate/${jobId}`),

  // My Creations
  getMyCreations: (cursor: number = 0, limit: number = 20) =>
    api.get('/api/studio/my-creations', { params: { cursor, limit } }),

  deleteImage: (imageId: number) =>
    api.delete(`/api/studio/my-creations/${imageId}`),

  // Credits
  getCreditsBalance: () => api.get('/api/studio/credits/balance'),
  purchaseCredits: (amount: number, idempotencyKey?: string) =>
    api.post('/api/studio/credits/purchase', null, { params: { amount, idempotency_key: idempotencyKey } }),

  // Community Posts (Phase 2)
  publishPost: (imageId: number, title: string, description: string, categoryId: number, tags?: string[], visibility: string = 'public') =>
    api.post('/api/studio/community/publish', {
      image_id: imageId,
      title,
      description,
      category_id: categoryId,
      tags,
      visibility,
    }),

  getCommunityFeed: (
    cursor: number = 0,
    limit: number = 20,
    categoryId?: number,
    search?: string,
    tier?: string,
    provider?: string,
    sortBy?: string
  ) => {
    const params: any = { cursor, limit };
    if (categoryId) params.category_id = categoryId;
    if (search) params.search = search;
    if (tier) params.tier = tier;
    if (provider) params.provider = provider;
    if (sortBy) params.sort_by = sortBy;
    return api.get('/api/studio/community/feed', { params });
  },

  getPostDetails: (postId: number) =>
    api.get(`/api/studio/community/posts/${postId}`),

  likePost: (postId: number) =>
    api.post(`/api/studio/community/posts/${postId}/like`),

  reportPost: (postId: number, reason: string, description?: string) =>
    api.post(`/api/studio/community/posts/${postId}/report`, { reason, description }),

  getRemixPrompt: (postId: number) =>
    api.get(`/api/studio/community/posts/${postId}/remix`),

  recordRemix: (postId: number, generatedImageId: number) =>
    api.post(`/api/studio/community/posts/${postId}/remix/record`, { generated_image_id: generatedImageId }),

  // User Profiles (Phase 3)
  getUserProfile: (userId: number) =>
    api.get(`/api/studio/community/users/${userId}/profile`),

  getUserPosts: (userId: number, cursor: number = 0, limit: number = 20) =>
    api.get(`/api/studio/community/users/${userId}/posts`, { params: { cursor, limit } }),

  // Comments (Phase 4)
  getComments: (postId: number, skip: number = 0, limit: number = 50) =>
    api.get(`/api/studio/posts/${postId}/comments`, { params: { skip, limit } }),

  createComment: (postId: number, text: string) =>
    api.post(`/api/studio/posts/${postId}/comments`, { text }),

  updateComment: (commentId: number, text: string) =>
    api.put(`/api/studio/comments/${commentId}`, { text }),

  deleteComment: (commentId: number) =>
    api.delete(`/api/studio/comments/${commentId}`),

  getCommentCount: (postId: number) =>
    api.get(`/api/studio/posts/${postId}/comments/count`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (cursor: number = 0, limit: number = 20, unreadOnly: boolean = false) =>
    api.get('/api/notifications/', { params: { cursor, limit, unread_only: unreadOnly } }),

  getStats: () =>
    api.get('/api/notifications/stats'),

  markAsRead: (notificationId: number) =>
    api.put(`/api/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    api.post('/api/notifications/mark-all-read'),

  deleteNotification: (notificationId: number) =>
    api.delete(`/api/notifications/${notificationId}`),
};

