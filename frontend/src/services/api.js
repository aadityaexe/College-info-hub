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
    // console.log("Header Token:", token); // Debug token
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access - redirecting to login");
      localStorage.removeItem('token');
      // Redirect to login - using window.location is simple and effective here
      // Alternatively, we could dispatch a redux action if we had access to store
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
          window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default API;
