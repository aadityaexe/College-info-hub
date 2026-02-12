import axios from 'axios';
import { mockAdapter } from './mock/index';

const USE_MOCK = false; // Toggle this to switch between real and mock backend

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Mock Adapter Logic
if (USE_MOCK) {
    API.defaults.adapter = mockAdapter;
}

// Add a request interceptor to include the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
