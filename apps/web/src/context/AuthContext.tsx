import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as authService from '../services/authService';
import { getMe } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { LoginInput } from 'shared-types';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithCredentials: (credentials: LoginInput) => Promise<void>;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  loginWithCredentials: async () => {},
  setCurrentUser: () => {},
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
      // Check if there's an auth cookie present
      const hasAuthCookie = document.cookie.includes('token=');

      if (!hasAuthCookie) {
        // No auth cookie, user is not authenticated
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        setIsLoading(false);
        return;
      }

      try {
        // Only make API call if auth cookie exists
        const currentUser = await getMe();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error: any) {
        // Cookie exists but is invalid/expired, handle silently for 401 errors
        if (error.response?.status === 401) {
          // Expected behavior for expired/invalid tokens
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Log unexpected errors
          console.error('Authentication check failed:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loginWithCredentials = async (credentials: LoginInput) => {
    try {
      await authService.login(credentials);
      const user = await authService.getMe();
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const setCurrentUser = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
    // You might want to navigate here as well, e.g., navigate('/dashboard');
    // For now, I'll keep it simple. The navigation can happen in the page.
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed on server:', error);
    } finally {
      setUser(null);
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
        loginWithCredentials,
        setCurrentUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 