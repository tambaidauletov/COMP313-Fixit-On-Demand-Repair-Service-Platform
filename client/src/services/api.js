import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add this function to preload user avatar
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject();
    img.src = url;
  });
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add this utility function
export const getImageUrl = (path) => {
  if (!path) return '';
  return `${API_URL}/api${path}`;
};

// Auth services
export const authService = {
  register: (userData) => {
    console.log('API service sending register request:', userData);
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    console.log('API service sending login request:', credentials);
    return api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/user');
      const userData = response.data;
      
      // If user has avatar, preload it
      if (userData.avatar) {
        const avatarUrl = `${API_URL}/api/auth/image/${userData.avatar}`;
        try {
          await preloadImage(avatarUrl);
          userData.avatarUrl = avatarUrl;
        } catch (err) {
          console.error('Failed to preload avatar:', err);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },
  updateProfile: (userData) => {
    const config = {
      headers: userData instanceof FormData ? 
        { 'Content-Type': 'multipart/form-data' } : 
        { 'Content-Type': 'application/json' }
    };
    return api.put('/auth/profile', userData, config);
  },
  forgotPassword: (email) => {
    console.log('Initiating password recovery for:', email);
    return api.post('/auth/forgotpassword', { email })
      .then(response => {
        console.log('Password recovery response:', response);
        return response;
      })
      .catch(error => {
        console.error('Password recovery error:', error.response?.data || error);
        throw error;
      });
  },
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  getImage: (filename) => {
    if (!filename) return Promise.reject('No filename provided');
    return api.get(`/auth/image/${filename}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/*',
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      }
    });
  },
  getAvatarUrl: (user) => {
    if (!user?.avatar) return '';
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${API_URL}/api/auth/image/${user.avatar}`;
  },
  verifyAndPreloadAvatar: async (user) => {
    if (!user?.avatar) return user;
    
    const avatarUrl = authService.getAvatarUrl(user);
    try {
      await preloadImage(avatarUrl);
      return { ...user, avatarUrl };
    } catch (err) {
      console.error('Failed to verify avatar:', err);
      return user;
    }
  }
};

// Listing services
export const listingService = {
  createListing: (listingData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(listingData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, listingData[key]);
      }
    });
    
    // Append images
    if (listingData.images) {
      listingData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getListings: (params) => api.get('/listings', { params }),
  getMyListings: async () => {
    try {
      const response = await api.get('/listings/mylistings');
      console.log('MyListings response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching my listings:', error.response || error);
      throw error;
    }
  },
  getListingById: (id) => api.get(`/listings/${id}`),
  updateListing: (id, listingData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(listingData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, listingData[key]);
      }
    });
    
    // Append images
    if (listingData.images) {
      listingData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.put(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteListing: (id) => api.delete(`/listings/${id}`),
  markAsSolved: (id) => api.put(`/listings/${id}/solve`)
};

// Message services
export const messageService = {
  sendMessage: async (conversationId, content, attachments = []) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      console.log('Sending message:', { conversationId, content });
      const response = await api.post(`/messages/conversations/${conversationId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Message sent successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  startConversation: async (listingId, initialMessage, attachments = []) => {
    try {
      const formData = new FormData();
      formData.append('listingId', listingId);
      formData.append('initialMessage', initialMessage);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      console.log('Starting conversation:', { listingId, initialMessage });
      const response = await api.post('/messages/conversations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Conversation started:', response.data);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },
  
  getConversations: async () => {
    try {
      console.log('Fetching conversations');
      const response = await api.get('/messages/conversations');
      console.log('Conversations fetched:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },
  
  getConversationMessages: async (conversationId) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const response = await api.get(`/messages/conversations/${conversationId}`);
      console.log('Messages fetched:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  markAsRead: async (conversationId) => {
    try {
      console.log('Marking conversation as read:', conversationId);
      const response = await api.put(`/messages/conversations/${conversationId}/read`);
      console.log('Conversation marked as read:', response.data);
      return response;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },

  reportMessage: async (messageId, reason) => {
    try {
      console.log('Reporting message:', { messageId, reason });
      const response = await api.post(`/messages/${messageId}/report`, { reason });
      console.log('Message reported:', response.data);
      return response;
    } catch (error) {
      console.error('Error reporting message:', error);
      throw error;
    }
  }
};

// Report services
export const reportService = {
  createReport: (reportData) => api.post('/reports', reportData),
  getReports: (params) => api.get('/reports', { params }),
  updateReportStatus: (id, status) => api.put(`/reports/${id}/status`, { status })
};

// User services
export const userService = {
  getUserById: (id) => api.get(`/users/${id}`),
  searchUsers: (params) => api.get('/users/search', { params })
};

// Service provider specific services
export const serviceProviderService = {
  getProfile: () => {
    console.log('Fetching service provider profile');
    return api.get('/service-provider/profile')
      .then(response => {
        console.log('Service provider profile response:', response);
        return response;
      })
      .catch(error => {
        console.error('Service provider profile fetch error:', error);
        throw error;
      });
  },
  
  updateProfile: (profileData) => {
    const formData = new FormData();
    
    // Handle basic fields
    Object.keys(profileData).forEach(key => {
      if (!['qualifications', 'identityDocuments', 'searchPreferences'].includes(key)) {
        formData.append(key, profileData[key]);
      }
    });
    
    // Handle search preferences
    if (profileData.searchPreferences) {
      formData.append('searchPreferences', JSON.stringify(profileData.searchPreferences));
    }
    
    return api.put('/service-provider/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  addQualification: (qualificationData) => {
    const formData = new FormData();
    Object.keys(qualificationData).forEach(key => {
      if (key === 'document') {
        formData.append('document', qualificationData.document);
      } else {
        formData.append(key, qualificationData[key]);
      }
    });
    return api.post('/service-provider/qualifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  updateSearchPreferences: (preferences) => 
    api.put('/service-provider/preferences', preferences)
};

// Admin services
export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
  createModerator: (userData) => api.post('/admin/moderators', userData),
  deleteModerator: (userId) => api.delete(`/admin/moderators/${userId}`)
};

export default api;