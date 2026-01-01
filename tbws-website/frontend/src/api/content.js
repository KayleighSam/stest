import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const contentAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
contentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Content Service - Main Export
export const contentService = {
  // ==================== Categories ====================
  getCategories: () => contentAPI.get('/content/categories/'),
  getCategory: (slug) => contentAPI.get(`/content/categories/${slug}/`),
  createCategory: (data) => contentAPI.post('/content/categories/', data),
  updateCategory: (slug, data) => contentAPI.patch(`/content/categories/${slug}/`, data),
  deleteCategory: (slug) => contentAPI.delete(`/content/categories/${slug}/`),

  // ==================== Tags ====================
  getTags: () => contentAPI.get('/content/tags/'),
  getTag: (slug) => contentAPI.get(`/content/tags/${slug}/`),
  createTag: (data) => contentAPI.post('/content/tags/', data),
  updateTag: (slug, data) => contentAPI.patch(`/content/tags/${slug}/`, data),
  deleteTag: (slug) => contentAPI.delete(`/content/tags/${slug}/`),

  // ==================== Posts ====================
  getPosts: (params) => contentAPI.get('/content/posts/', { params }),
  getPost: (slug) => contentAPI.get(`/content/posts/${slug}/`),
  
  createPost: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'tags' && Array.isArray(data[key])) {
        data[key].forEach(tag => formData.append('tags', tag));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return contentAPI.post('/content/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  updatePost: (slug, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'tags' && Array.isArray(data[key])) {
        data[key].forEach(tag => formData.append('tags', tag));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return contentAPI.patch(`/content/posts/${slug}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  deletePost: (slug) => contentAPI.delete(`/content/posts/${slug}/`),
  publishPost: (slug) => contentAPI.post(`/content/posts/${slug}/publish/`),
  unpublishPost: (slug) => contentAPI.post(`/content/posts/${slug}/unpublish/`),
  getFeaturedPosts: () => contentAPI.get('/content/posts/featured/'),
  getLatestPosts: () => contentAPI.get('/content/posts/latest/'),

  // ==================== Contact Messages ====================
  getMessages: (params) => contentAPI.get('/content/contactmessage/', { params }),
  getMessage: (id) => contentAPI.get(`/content/contactmessage/${id}/`),
  markMessageRead: (id) => contentAPI.post(`/content/contactmessage/${id}/mark_read/`),
  markMessageReplied: (id) => contentAPI.post(`/content/contactmessage/${id}/mark_replied/`),
  deleteMessage: (id) => contentAPI.delete(`/content/contactmessage/${id}/`),
  
  // Public contact endpoint
  submitContactMessage: (data) => contentAPI.post('/content/contact/', data),

  // ==================== Newsletter ====================
  getSubscribers: (params) => contentAPI.get('/content/newsletter/', { params }),
  getSubscriber: (id) => contentAPI.get(`/content/newsletter/${id}/`),
  deleteSubscriber: (id) => contentAPI.delete(`/content/newsletter/${id}/`),
  
  // Public subscribe endpoint
  subscribeNewsletter: (data) => contentAPI.post('/content/newsletter/subscribe/', data),

  // ==================== Comments ====================
  getComments: (params) => contentAPI.get('/content/comments/', { params }),
  getComment: (id) => contentAPI.get(`/content/comments/${id}/`),
  createComment: (data) => contentAPI.post('/content/comments/', data),
  updateComment: (id, data) => contentAPI.patch(`/content/comments/${id}/`, data),
  approveComment: (id) => contentAPI.patch(`/content/comments/${id}/`, { is_approved: true }),
    deleteComment: (id) => contentAPI.delete(`/content/comments/${id}/`),
  
    // ==================== Contact Messages ====================
getMessages: (params) => contentAPI.get('/content/contactmessage/', { params }),
getMessage: (id) => contentAPI.get(`/content/contactmessage/${id}/`),
markMessageRead: (id) => contentAPI.post(`/content/contactmessage/${id}/mark_read/`),
markMessageReplied: (id, notes = '') => 
  contentAPI.post(`/content/contactmessage/${id}/mark_replied/`, { notes }),
updateMessageNotes: (id, notes) => 
  contentAPI.patch(`/content/contactmessage/${id}/update_notes/`, { notes }),
deleteMessage: (id) => contentAPI.delete(`/content/contactmessage/${id}/`),

// Public contact endpoint
submitContactMessage: (data) => contentAPI.post('/content/contact/', data),
};

// Default export
export default contentService;