import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerLogout } from '../utils/logoutHandler';

const api = axios.create({
  baseURL: 'https://crm.walstartechnologies.com/api/',
  // baseURL: 'https://45c03307c9ff.ngrok-free.app/api/',
  headers: {
    'Content-Type': 'application/json',  
  },
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to catch auth errors globally
api.interceptors.response.use(
  response => response,
  async error => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || '';
    // Detect Laravel-style unauthenticated or explicit HTTP 401
    const isUnauthenticated =
      status === 401 ||
      /unauthenticated|token may be expired|invalid token/i.test(String(message));

    if (isUnauthenticated) {
      try {
        await AsyncStorage.removeItem('token');
      } catch (_) {}
      // Notify the app to perform a proper logout flow
      triggerLogout(message || 'Unauthenticated');
    }

    return Promise.reject(error);
  },
);

export default api;
