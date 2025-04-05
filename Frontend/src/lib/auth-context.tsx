import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from './api';

interface User {
  fullname: string;
  mobileno: string;
  _id?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (mobileno: string, password: string) => Promise<void>;
  register: (fullname: string, mobileno: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get user from localStorage if available
const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUserFromStorage());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a user in localStorage first
    const storedUser = getUserFromStorage();
    const token = localStorage.getItem('userToken');
    
    if (storedUser && token) {
      setUser(storedUser);
      setIsLoading(false);
    } else {
      // Try to get user from the backend
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('userToken');
      // Only attempt to get user data if we have a token
      if (token) {
        const userData = await auth.getCurrentUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('userToken');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (mobileno: string, password: string) => {
    try {
      const response = await auth.login({ mobileno, password });
      if (response.token && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // Fallback to get user data if not provided in login response
        const userData = await auth.getCurrentUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (fullname: string, mobileno: string, password: string) => {
    try {
      const response = await auth.register({ fullname, mobileno, password });
      if (response.token && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // After registration, log the user in
        await login(mobileno, password);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 