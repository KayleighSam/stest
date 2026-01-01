import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with auth
const galleryAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
galleryAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export the axios instance
export { galleryAPI };

// Gallery Service
export const galleryService = {
  // ==================== Albums - Full CRUD ====================
  getAlbums: (params) => galleryAPI.get('/gallery/albums/', { params }),
  getAlbum: (id) => galleryAPI.get(`/gallery/albums/${id}/`),
  createAlbum: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return galleryAPI.post('/gallery/albums/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateAlbum: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return galleryAPI.patch(`/gallery/albums/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAlbum: (id) => galleryAPI.delete(`/gallery/albums/${id}/`),
  getFeaturedAlbums: () => galleryAPI.get('/gallery/albums/featured/'),

  // ==================== Images - Full CRUD ====================
  getImages: (params) => galleryAPI.get('/gallery/images/', { params }),
  getImage: (id) => galleryAPI.get(`/gallery/images/${id}/`),
  createImage: (data) => {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('title', data.title);
    formData.append('album', data.album);
    if (data.description) formData.append('description', data.description);
    if (data.photographer) formData.append('photographer', data.photographer);
    if (data.location) formData.append('location', data.location);
    
    return galleryAPI.post('/gallery/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateImage: (id, data) => galleryAPI.patch(`/gallery/images/${id}/`, data),
  deleteImage: (id) => galleryAPI.delete(`/gallery/images/${id}/`),
  getFeaturedImages: () => galleryAPI.get('/gallery/images/featured/'),
  getRecentImages: () => galleryAPI.get('/gallery/images/recent/'),

  // ==================== Upload Multiple Images ====================
  uploadImages: async (files, albumId) => {
    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', file.name.split('.')[0]);
      formData.append('album', albumId);
      
      return galleryAPI.post('/gallery/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });
    
    return Promise.all(uploadPromises);
  },
};

export default galleryService;