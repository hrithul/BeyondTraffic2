import axios from 'axios';
import config from '../config';

const axiosInstance = axios.create({
  baseURL: config.hostname,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Send just the token without 'Bearer ' prefix
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Only logout on 401 Unauthorized, not on 403 Forbidden
    if (error.response?.status === 401) {
      // Clear auth-related items from localStorage
      const authItems = ['token', 'islogin', 'authenticated', 'loginUser', 'loginUserId'];
      authItems.forEach(item => localStorage.removeItem(item));
      
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
