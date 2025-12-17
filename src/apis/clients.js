import axios from 'axios';
import { store } from '../../store'; // Import your Redux store

const axiosInstance = axios.create({
  baseURL: 'https://cravess.createdinam.com/api/v1/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async config => {
    try {
      // Access token from Redux store
      const token = store.getState()?.user?.token?.access_token || store.getState()?.user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from store:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    // Handle errors globally
    if (error.response) {
      // Server responded with a status other than 200 range
      console.log('Response error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized errors - clear token and redirect to login
        try {
          const {clearToken} = await import('../features/userSlice');
          store.dispatch(clearToken());
          // You can add navigation logic here if needed
          console.log('Token cleared due to 401 unauthorized error');
        } catch (e) {
          console.error('Error clearing token:', e);
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      console.log('Request error:', error.request);
    } else {
      // Something happened in setting up the request
      console.log('Error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
