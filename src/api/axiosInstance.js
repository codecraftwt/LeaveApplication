import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://crm.walstartechnologies.com/api/',
  headers: {
    'Content-Type': 'application/json',  // 🔑 Important!
  },
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token'); 
    console.log('token---------------->', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
