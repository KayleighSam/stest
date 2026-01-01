import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const pagesAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
pagesAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { pagesAPI };

// ✅ FIXED - Only append File objects for images, skip URL strings
const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Skip null, undefined, empty strings
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // ✅ FIX: Only append File objects for image fields, skip URL strings
    if (value instanceof File) {
      formData.append(key, value);
    } 
    // ✅ For image fields that are URLs (not changed), skip them
    else if (typeof value === 'string' && value.startsWith('http')) {
      // Skip - this is an existing image URL, not a new file
      return;
    }
    // ✅ Append all other values (text fields, etc.)
    else {
      formData.append(key, value);
    }
  });
  
  return formData;
};

export const pagesService = {
  // ==================== Site Settings ====================
  getSettings: () => {
    console.log('📤 GET /api/settings/');
    return pagesAPI.get('/settings/');
  },
  
  getCurrentSettings: () => {
    console.log('📤 GET /api/settings/current/');
    return pagesAPI.get('/settings/current/');
  },
  
  updateSettings: (id, data) => {
    console.log('📤 PATCH /api/settings/' + id + '/');
    console.log('📝 Update data:', data);
    return pagesAPI.patch(`/settings/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ==================== Pages ====================
  getPages: (params) => pagesAPI.get('/pages/', { params }),
  getPage: (slug) => pagesAPI.get(`/pages/${slug}/`),
  createPage: (data) => {
    return pagesAPI.post('/pages/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updatePage: (slug, data) => {
    return pagesAPI.patch(`/pages/${slug}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deletePage: (slug) => pagesAPI.delete(`/pages/${slug}/`),

  // ==================== Core Values ====================
  getCoreValues: () => pagesAPI.get('/core-values/'),
  createCoreValue: (data) => pagesAPI.post('/core-values/', data),
  updateCoreValue: (id, data) => pagesAPI.patch(`/core-values/${id}/`, data),
  deleteCoreValue: (id) => pagesAPI.delete(`/core-values/${id}/`),

  // ==================== Team Members ====================
  getTeamMembers: () => pagesAPI.get('/team/'),
  createTeamMember: (data) => {
    return pagesAPI.post('/team/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateTeamMember: (id, data) => {
    return pagesAPI.patch(`/team/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteTeamMember: (id) => pagesAPI.delete(`/team/${id}/`),

  // ==================== FAQs ====================
  getFAQs: () => pagesAPI.get('/faq/'),
  createFAQ: (data) => pagesAPI.post('/faq/', data),
  updateFAQ: (id, data) => pagesAPI.patch(`/faq/${id}/`, data),
  deleteFAQ: (id) => pagesAPI.delete(`/faq/${id}/`),

  // ==================== History Timeline ====================
  getHistoryTimeline: () => pagesAPI.get('/history/'),
  createHistoryEvent: (data) => {
    return pagesAPI.post('/history/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateHistoryEvent: (id, data) => {
    return pagesAPI.patch(`/history/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteHistoryEvent: (id) => pagesAPI.delete(`/history/${id}/`),

  // ==================== Sponsors ====================
  getSponsors: () => pagesAPI.get('/sponsors/'),
  createSponsor: (data) => {
    return pagesAPI.post('/sponsors/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateSponsor: (id, data) => {
    return pagesAPI.patch(`/sponsors/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteSponsor: (id) => pagesAPI.delete(`/sponsors/${id}/`),

  // ==================== League Rules ====================
  getLeagueRules: () => pagesAPI.get('/league-rules/'),
  createLeagueRule: (data) => pagesAPI.post('/league-rules/', data),
  updateLeagueRule: (id, data) => pagesAPI.patch(`/league-rules/${id}/`, data),
  deleteLeagueRule: (id) => pagesAPI.delete(`/league-rules/${id}/`),

  // ==================== Venues ====================
  getVenues: () => pagesAPI.get('/venues/'),
  createVenue: (data) => {
    return pagesAPI.post('/venues/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateVenue: (id, data) => {
    return pagesAPI.patch(`/venues/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteVenue: (id) => pagesAPI.delete(`/venues/${id}/`),

  // ==================== Draft Info ====================
  getDraftInfo: () => pagesAPI.get('/draft-info/'),
  getCurrentDraftInfo: () => pagesAPI.get('/draft-info/current/'),
  updateDraftInfo: (id, data) => {
    return pagesAPI.patch(`/draft-info/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ==================== Manager Info ====================
  getManagerInfo: () => pagesAPI.get('/manager-info/'),
  getCurrentManagerInfo: () => pagesAPI.get('/manager-info/current/'),
  updateManagerInfo: (id, data) => pagesAPI.patch(`/manager-info/${id}/`, data),

  // ==================== Managers ====================
  getManagers: () => pagesAPI.get('/managers/'),
  createManager: (data) => {
    return pagesAPI.post('/managers/', createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateManager: (id, data) => {
    return pagesAPI.patch(`/managers/${id}/`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteManager: (id) => pagesAPI.delete(`/managers/${id}/`),
};

export default pagesService;