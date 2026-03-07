import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/auth';
import { ApiError } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      const userData = await authService.getUserData();

      setIsAuthenticated(authenticated);
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Empty dependency array - only run once on mount

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setIsAuthenticated(true);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      const userData = await authService.getUserData();

      if (!authenticated || !userData) {
        console.log('🔐 Authentication lost, redirecting to login');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Global error handler for authentication errors
  useEffect(() => {
    // Only set up error handlers in web environment
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleAuthError = (event: ErrorEvent) => {
        if (event.error instanceof ApiError) {
          const apiError = event.error as ApiError;

          // Check if it's an authentication error
          if (apiError.status === 401 || apiError.body?.code === 'AUTH_EXPIRED') {
            console.log('🔐 Authentication error detected, logging out...');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      };

      // Listen for unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (event.reason instanceof ApiError) {
          const apiError = event.reason as ApiError;

          if (apiError.status === 401 || apiError.body?.code === 'AUTH_EXPIRED') {
            console.log('🔐 Authentication error in promise, logging out...');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      };

      window.addEventListener('error', handleAuthError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleAuthError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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
