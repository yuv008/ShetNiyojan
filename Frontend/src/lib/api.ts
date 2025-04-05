import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed to false since Flask backend uses token-based auth
});

// Add request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['x-access-token'] = token;
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

export interface YieldData {
  id?: string;
  name: string;
  acres: number;
  status?: "growing" | "harvested" | "planning";
  health?: number;
  plantDate?: string;
  userId?: string;
}

export const auth = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/users/login', credentials);
    // Store token if it's in the response
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/users/register', data);
    // After registration, try to log in automatically
    if (response.data.message === 'Registration successful') {
      await auth.login({ mobileno: data.mobileno, password: data.password });
    }
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
      // Use the profile endpoint to get current user data
      const response = await api.get('/users/profile');
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
};

export const yields = {
  // Get all yields for the current user
  getAll: async () => {
    try {
      const response = await api.get('/yields');
      return response.data;
    } catch (error) {
      console.error('Error fetching yields:', error);
      throw error;
    }
  },

  // Get a specific yield by ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/yields/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching yield ${id}:`, error);
      throw error;
    }
  },

  // Create a new yield
  create: async (yieldData: YieldData) => {
    try {
      const response = await api.post('/yields', yieldData);
      return response.data;
    } catch (error) {
      console.error('Error creating yield:', error);
      throw error;
    }
  },

  // Update an existing yield
  update: async (id: string, yieldData: Partial<YieldData>) => {
    try {
      const response = await api.put(`/yields/${id}`, yieldData);
      return response.data;
    } catch (error) {
      console.error(`Error updating yield ${id}:`, error);
      throw error;
    }
  },

  // Delete a yield
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/yields/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting yield ${id}:`, error);
      throw error;
    }
  }
};

export default api; 