import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const usersAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
usersAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to create FormData
const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // Only append File objects for image fields
    if (value instanceof File) {
      formData.append(key, value);
    } 
    // Skip existing image URLs
    else if (typeof value === 'string' && value.startsWith('http')) {
      return;
    }
    else {
      formData.append(key, value);
    }
  });
  
  return formData;
};

export const usersService = {
  // ==================== Users ====================
  getUsers: (params) => {
    console.log('📤 GET /api/users/');
    return usersAPI.get('/users/', { params });
  },
  
  getUser: (id) => {
    console.log(`📤 GET /api/users/${id}/`);
    return usersAPI.get(`/users/${id}/`);
  },
  
  createUser: (data) => {
    console.log('📤 POST /api/users/');
    return usersAPI.post('/users/', data);
  },
  
  updateUser: (id, data) => {
    console.log(`📤 PATCH /api/users/${id}/`);
    return usersAPI.patch(`/users/${id}/`, data);
  },
  
  deleteUser: (id) => {
    console.log(`📤 DELETE /api/users/${id}/`);
    return usersAPI.delete(`/users/${id}/`);
  },
  
  activateUser: (id) => {
    console.log(`📤 POST /api/users/${id}/activate/`);
    return usersAPI.post(`/users/${id}/activate/`);
  },
  
  deactivateUser: (id) => {
    console.log(`📤 POST /api/users/${id}/deactivate/`);
    return usersAPI.post(`/users/${id}/deactivate/`);
  },
  
  suspendUser: (id) => {
    console.log(`📤 POST /api/users/${id}/suspend/`);
    return usersAPI.post(`/users/${id}/suspend/`);
  },
  
  changeUserRole: (id, role) => {
    console.log(`📤 PATCH /api/users/${id}/change_role/`);
    return usersAPI.patch(`/users/${id}/change_role/`, { role });
  },
  
  // ==================== Players ====================
  getPlayers: (params) => {
    console.log('📤 GET /api/players/');
    return usersAPI.get('/players/', { params });
  },
  
  getPlayer: (id) => {
    console.log(`📤 GET /api/players/${id}/`);
    return usersAPI.get(`/players/${id}/`);
  },
  
  createPlayer: (data) => {
    console.log('📤 POST /api/players/');
    return usersAPI.post('/players/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  updatePlayer: (id, data) => {
    console.log(`📤 PATCH /api/players/${id}/`);
    return usersAPI.patch(`/players/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  deletePlayer: (id) => {
    console.log(`📤 DELETE /api/players/${id}/`);
    return usersAPI.delete(`/players/${id}/`);
  },
  
  setPlayerStatus: (id, status) => {
    console.log(`📤 POST /api/players/${id}/set_status/`);
    return usersAPI.post(`/players/${id}/set_status/`, { status });
  },
  
  // ==================== Login History ====================
  getLoginHistory: () => {
    console.log('📤 GET /api/auth/login-history/');
    return usersAPI.get('/auth/login-history/');
  },
};

export default usersService;