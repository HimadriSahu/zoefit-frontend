import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      const userData = await authService.getUserData();

      if (!authenticated || !userData) {
        console.log('🔐 Authentication check failed, clearing any remaining data');
        await authService.clearStorage();
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to login screen
        router.replace('/LoginScreen');
      } else {
        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Check if it's an auth expired error
      if (error instanceof ApiError && error.status === 401 && (error as any).code === 'AUTH_EXPIRED') {
        console.log('🚨 Authentication expired, redirecting to login');
        await authService.clearStorage();
        setIsAuthenticated(false);
        setUser(null);
        router.replace('/LoginScreen');
        return;
      }
      await authService.clearStorage();
      setIsAuthenticated(false);
      setUser(null);
      // Redirect to login screen
      router.replace('/LoginScreen');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
      // Redirect to login screen
      router.replace('/LoginScreen');
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      const userData = await authService.getUserData();

      if (!authenticated || !userData) {
        console.log('🔐 Authentication lost during refresh, clearing data and redirecting to login');
        await authService.clearStorage();
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to login screen
        router.replace('/LoginScreen');
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      // Check if it's an auth expired error
      if (error instanceof ApiError && error.status === 401 && (error as any).code === 'AUTH_EXPIRED') {
        console.log('🚨 Authentication expired during refresh, redirecting to login');
        await authService.clearStorage();
        setIsAuthenticated(false);
        setUser(null);
        router.replace('/LoginScreen');
        return;
      }
      await authService.clearStorage();
      setIsAuthenticated(false);
      setUser(null);
      // Redirect to login screen
      router.replace('/LoginScreen');
    }
  }, [router]);

  // Global error handler for authentication errors
  useEffect(() => {
    // Only set up error handlers in web environment
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleAuthError = (event: ErrorEvent) => {
        const error = event.error;

        // Check for different types of authentication errors
        const isAuthError = error instanceof ApiError && (
          error.status === 401 ||
          error.body?.code === 'AUTH_EXPIRED' ||
          error.body?.requires_relogin ||
          error.message?.includes('Authentication expired') ||
          error.message?.includes('AUTH_EXPIRED')
        );

        const isStringAuthError = typeof error === 'string' && error === 'AUTH_EXPIRED';

        if (isAuthError || isStringAuthError) {
          console.log('🔐 Authentication error detected, logging out...', error);
          handleAuthLogout();
        }
      };

      // Listen for unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason;

        // Check for different types of authentication errors
        const isAuthError = error instanceof ApiError && (
          error.status === 401 ||
          error.body?.code === 'AUTH_EXPIRED' ||
          error.body?.requires_relogin ||
          error.message?.includes('Authentication expired') ||
          error.message?.includes('AUTH_EXPIRED')
        );

        const isStringAuthError = typeof error === 'string' && error === 'AUTH_EXPIRED';

        if (isAuthError || isStringAuthError) {
          console.log('🔐 Authentication error in promise, logging out...', error);
          handleAuthLogout();
        }
      };

      // Centralized logout handler
      const handleAuthLogout = async () => {
        try {
          console.log('🧹 Clearing authentication data due to auth error');
          await authService.clearStorage?.();
          setIsAuthenticated(false);
          setUser(null);
          // Redirect to login screen
          router.replace('/LoginScreen');
        } catch (logoutError) {
          console.error('Error during auth logout:', logoutError);
          // Force logout even if clearing storage fails
          setIsAuthenticated(false);
          setUser(null);
          router.replace('/LoginScreen');
        }
      };

      window.addEventListener('error', handleAuthError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleAuthError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [router]);

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
