import axiosClient from "../axios-client";

const api = {
  // Auth
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  forgotPassword: (data) => axiosClient.post('/password/forgot', data),
  resetPassword: (data) => axiosClient.post('/password/reset', data),
  getProfile: () => axiosClient.get('/auth/user'),

  // Properties
  getProperties: (filters = {}) => axiosClient.get('/properties', { params: filters }),
  getFeaturedProperties: () => axiosClient.get('/properties/featured'),
  getProperty: (id) => axiosClient.get(`/properties/${id}`),

  // Bookings
  createBooking: (data) => axiosClient.post('/user/bookings', data),
  getUserBookings: () => axiosClient.get('/user/bookings'),
  cancelBooking: (id) => axiosClient.post(`/user/bookings/${id}/cancel`),

  // Saved properties
  getSavedProperties: () => axiosClient.get('/user/saved-properties'),
  toggleSavedProperty: (id) => axiosClient.post(`/user/saved-properties/${id}`),

  // General
  getAgents: (params = {}) => axiosClient.get('/agents', { params }),
  getAgent: (id) => axiosClient.get(`/agents/${id}`),
  contactOp: (data) => axiosClient.post('/contact', data),
};

export default api;
