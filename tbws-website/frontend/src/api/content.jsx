import axiosInstance from './axios';

export const contentAPI = {
  // Posts
  getPosts: async (params) => {
    const response = await axiosInstance.get('/api/content/posts/', { params });
    return response.data;
  },
  
  getPost: async (id) => {
    const response = await axiosInstance.get(`/api/content/posts/${id}/`);
    return response.data;
  },
  
  getPostBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/content/posts/${slug}/`);
    return response.data;
  },
  
  getFeaturedPosts: async () => {
    const response = await axiosInstance.get('/api/content/posts/featured/');
    return response.data;
  },
  
  getRelatedPosts: async (slug) => {
    try {
      const response = await axiosInstance.get(`/api/content/posts/${slug}/related/`);
      return response.data;
    } catch (error) {
      console.error('Related posts error:', error);
      return [];
    }
  },
  
  // Events
  getUpcomingEvents: async () => {
    const response = await axiosInstance.get('/api/content/posts/upcoming-events/');
    return response.data;
  },
  
  getPastEvents: async () => {
    const response = await axiosInstance.get('/api/content/posts/past-events/');
    return response.data;
  },
  
  getAllEvents: async (params) => {
    const response = await axiosInstance.get('/api/content/posts/', {
      params: { ...params, post_type: 'event' }
    });
    return response.data;
  },
  
  // Categories
  getCategories: async () => {
    const response = await axiosInstance.get('/api/content/categories/');
    return response.data;
  },
  
  getCategory: async (id) => {
    const response = await axiosInstance.get(`/api/content/categories/${id}/`);
    return response.data;
  },
  
  // Tags
  getTags: async () => {
    const response = await axiosInstance.get('/api/content/tags/');
    return response.data;
  },
  
  // Comments
  getComments: async (postId) => {
    const response = await axiosInstance.get('/api/content/comments/', { 
      params: { post: postId } 
    });
    return response.data;
  },
  
  createComment: async (data) => {
    const response = await axiosInstance.post('/api/content/comments/', data);
    return response.data;
  },
  
  // Contact
  submitContact: async (data) => {
    const response = await axiosInstance.post('/api/content/contact/', data);
    return response.data;
  },
  
  // Newsletter
  subscribeNewsletter: async (email) => {
    const response = await axiosInstance.post('/api/content/newsletter/', { email });
    return response.data;
  },
};