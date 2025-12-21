import axiosInstance from './axios';

export const galleryAPI = {
  // Albums
  getAlbums: async (params) => {
    const response = await axiosInstance.get('/api/gallery/albums/', { params });
    console.log('getAlbums response:', response.data); // DEBUG
    return response.data;
  },
  
  getAlbum: async (id) => {
    const response = await axiosInstance.get(`/api/gallery/albums/${id}/`);
    return response.data;
  },
  
  getFeaturedAlbums: async () => {
    const response = await axiosInstance.get('/api/gallery/albums/featured/');
    return response.data;
  },

  // Images
  getImages: async (params) => {
    const response = await axiosInstance.get('/api/gallery/images/', { params });
    console.log('getImages response:', response.data); // DEBUG
    return response.data;
  },
  
  getImage: async (id) => {
    const response = await axiosInstance.get(`/api/gallery/images/${id}/`);
    return response.data;
  },
  
  getFeaturedImages: async () => {
    const response = await axiosInstance.get('/api/gallery/images/featured/');
    return response.data;
  },
  
  getRecentImages: async () => {
    const response = await axiosInstance.get('/api/gallery/images/recent/');
    return response.data;
  },
};