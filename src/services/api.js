import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://render-backend-s6uj.onrender.com/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add HTTPS configuration for production
  httpsAgent: import.meta.env.VITE_NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : undefined,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('Unable to connect to server. Please check your internet connection.');
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Forbidden (likely not an admin). Force re-auth.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log errors in development
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

export const adminAPI = {
  getAttendance: (params) => api.get('/admin/attendance', { params }),
  updateAttendance: (employeeId, data) => api.patch(`/admin/attendance/${employeeId}`, data),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  // Legacy employees-only endpoints
  getEmployees: () => api.get('/admin/employees'),
  createEmployee: (data) => api.post('/admin/employees', data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  // Unified users endpoints (admins + employees)
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLeaves: () => api.get('/admin/leaves'),
  updateLeaveStatus: (id, status) => api.patch(`/admin/leaves/${id}`, { status }),
  autoFillLeaves: (dates) => api.post('/admin/leaves/autofill', dates),
  calculateSalary: (data) => api.post('/admin/salary/calculate', data),
  getDashboard: () => api.get('/admin/dashboard'),
  // EODs
  getEods: (params) => api.get('/admin/eods', { params }),
  // Geofence Management
  getGeofenceLocations: () => api.get('/admin/geofence-locations'),
  createGeofenceLocation: (data) => api.post('/admin/geofence-locations', data),
  updateGeofenceLocation: (id, data) => api.put(`/admin/geofence-locations/${id}`, data),
  deleteGeofenceLocation: (id) => api.delete(`/admin/geofence-locations/${id}`),
  validateLocation: (data) => api.post('/admin/validate-location', data),
};

export const employeeAPI = {
  getProfile: () => api.get('/employee/profile'),
  markAttendance: (data) => api.post('/employee/attendance', data),
  checkIn: (payload) => api.post('/employee/attendance/check-in', payload),
  checkOut: (payload) => api.post('/employee/attendance/check-out', payload),
  getAttendance: (params) => api.get('/employee/attendance', { params }),
  submitLeave: (data) => api.post('/employee/leaves', data),
  getLeaves: () => api.get('/employee/leaves'),
  getSalary: (params) => api.get('/employee/salary', { params }),
  // EODs
  submitEod: (data) => api.post('/employee/eod', data),
  getEods: (params) => api.get('/employee/eod', { params }),
  updateEod: (id, data) => api.put(`/employee/eod/${id}`, data),
};

export default api;
