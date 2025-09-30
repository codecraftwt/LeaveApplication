import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default api;
