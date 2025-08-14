import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// 인증 API
export const authAPI = {
  login: (email, name) => api.post('/auth/login', { email, name }),
  getProfile: () => api.get('/auth/profile'),
};

// 문서 API
export const documentAPI = {
  upload: (formData) => {
    return api.post('/docs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getList: (params) => api.get('/docs', { params }),
  getById: (id) => api.get(`/docs/${id}`),
  trackView: (id, page) => api.post(`/docs/${id}/track`, { page }),
};

// 공유 API
export const shareAPI = {
  create: (docId, data) => api.post(`/share/${docId}`, data),
  getByLink: (linkId, password) => {
    const params = password ? { password } : {};
    return api.get(`/share/${linkId}`, { params });
  },
  getSettings: (docId) => api.get(`/share/settings/${docId}`),
  disable: (docId) => api.delete(`/share/${docId}`),
};

// AI API
export const aiAPI = {
  run: (docId, options) => api.post(`/ai/${docId}/run`, { options }),
  getResult: (docId) => api.get(`/ai/${docId}/result`),
  getHistory: (docId) => api.get(`/ai/${docId}/history`),
};

// 리뷰 API
export const reviewAPI = {
  createRequest: (docId, data) => api.post(`/reviews/${docId}/requests`, data),
  getRequests: (docId) => api.get(`/reviews/${docId}/requests`),
  getRequestForm: (requestId) => api.get(`/reviews/requests/${requestId}`),
  submitReview: (requestId, data) => api.post(`/reviews/requests/${requestId}/submit`, data),
  getResponses: (requestId) => api.get(`/reviews/requests/${requestId}/responses`),
};

// 코멘트 API
export const commentAPI = {
  getByDoc: (docId, page) => {
    const params = page !== undefined ? { page } : {};
    return api.get(`/comments/${docId}`, { params });
  },
  create: (docId, data) => api.post(`/comments/${docId}`, data),
  update: (docId, commentId, data) => api.put(`/comments/${docId}/${commentId}`, data),
  delete: (docId, commentId) => api.delete(`/comments/${docId}/${commentId}`),
  getStats: (docId) => api.get(`/comments/${docId}/stats`),
};

export default api;