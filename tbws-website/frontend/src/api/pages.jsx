import axiosInstance from './axios';

export const pagesAPI = {
  // Pages
  getPages: async () => {
    const response = await axiosInstance.get('/api/pages/');
    return response.data;
  },
  
  getPage: async (slug) => {
    const response = await axiosInstance.get(`/api/pages/${slug}/`);
    return response.data;
  },
  
  // Site Settings
  getSiteSettings: async () => {
    const response = await axiosInstance.get('/api/settings/current/');
    return response.data;
  },
  
  // Core Values
  getCoreValues: async () => {
    const response = await axiosInstance.get('/api/core-values/');
    return response.data;
  },
  
  // Team Members
  getTeamMembers: async (params) => {
    const response = await axiosInstance.get('/api/team/', { params });
    return response.data;
  },
  
  getTeamMember: async (id) => {
    const response = await axiosInstance.get(`/api/team/${id}/`);
    return response.data;
  },
  
  // History Timeline
  getHistory: async () => {
    const response = await axiosInstance.get('/api/history/');
    return response.data;
  },
  
  // Sponsors
  getSponsors: async (params) => {
    const response = await axiosInstance.get('/api/sponsors/', { params });
    return response.data;
  },
  
  // FAQ
  getFAQ: async (params) => {
    const response = await axiosInstance.get('/api/faq/', { params });
    return response.data;
  },

  // League Rules
  getLeagueRules: async () => {
    const response = await axiosInstance.get('/api/league-rules/');
    return response.data;
  },

  getLeagueRulesByCategory: async () => {
    const response = await axiosInstance.get('/api/league-rules/by_category/');
    return response.data;
  },

  // Venues
  getVenues: async () => {
    const response = await axiosInstance.get('/api/venues/');
    return response.data;
  },

  getPrimaryVenue: async () => {
    const response = await axiosInstance.get('/api/venues/primary/');
    return response.data;
  },

  getVenue: async (id) => {
    const response = await axiosInstance.get(`/api/venues/${id}/`);
    return response.data;
  },

  // Draft Info
  getDraftInfo: async () => {
    const response = await axiosInstance.get('/api/draft-info/current/');
    return response.data;
  },

  // Manager Info
  getManagerInfo: async () => {
    const response = await axiosInstance.get('/api/manager-info/current/');
    return response.data;
  },

  // Managers
  getManagers: async () => {
    const response = await axiosInstance.get('/api/managers/');
    return response.data;
  },

  getManager: async (id) => {
    const response = await axiosInstance.get(`/api/managers/${id}/`);
    return response.data;
  },
};