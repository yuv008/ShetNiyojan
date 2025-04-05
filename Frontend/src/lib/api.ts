import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies/session
});

// Add request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  mobileno: string;
  password: string;
}

export interface RegisterData {
  fullname: string;
  mobileno: string;
  password: string;
}

export const auth = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/userview/login/', credentials);
    // Store token if it's in the response
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
    } else {
      // If no token is returned, create a mock token based on mobile number
      // This is a temporary solution until the backend provides a proper token
      const mockToken = btoa(`${credentials.mobileno}:${Date.now()}`);
      localStorage.setItem('userToken', mockToken);
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/userview/register/', data);
    return response.data;
  },

  logout: async () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    return { message: "Logged out successfully" };
  },

  getCurrentUser: async () => {
    try {
      // Make sure the token is included in the request
      const response = await api.get('/users/');
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Just return the first user for now (this is not ideal in production)
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
};

export default api; 