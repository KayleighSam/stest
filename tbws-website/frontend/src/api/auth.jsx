import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('admin_access_token', access);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return authAPI(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await authAPI.post('/auth/login/', { email, password });
    
    if (response.data.access) {
      localStorage.setItem('admin_access_token', response.data.access);
      localStorage.setItem('admin_refresh_token', response.data.refresh);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        await authAPI.post('/auth/logout/', { refresh: refreshToken });
      }
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await authAPI.get('/auth/me/');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    const response = await authAPI.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    localStorage.setItem('admin_access_token', response.data.access);
    return response.data;
  },

  // Verify token
  verifyToken: async (token) => {
    const response = await authAPI.post('/auth/token/verify/', { token });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('admin_access_token');
    return !!token;
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getStoredUser();
    return user && (user.role === 'admin' || user.role === 'super_admin' || user.is_staff);
  },
};

export default authService;