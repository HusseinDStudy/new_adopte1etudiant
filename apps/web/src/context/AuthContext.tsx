import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as authService from '../services/authService';
import { getMe } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Not authenticated', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed on server:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      // ... existing code ...
    } catch (error) {
      // ... existing code ...
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 