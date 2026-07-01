// Global Error Handler for ZoeFit App
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

export interface AppError {
  message: string;
  code?: string;
  requires_relogin?: boolean;
  isNetworkError?: boolean;
}

export class ErrorHandler {
  private static router: ReturnType<typeof useRouter>;

  static initialize(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }

  static handleError(error: any, context?: string): void {
    console.error(`🚨 Error in ${context || 'app'}:`, error);

    // Check for authentication errors
    if (this.isAuthenticationError(error)) {
      this.handleAuthenticationError();
      return;
    }

    // Check for network errors
    if (this.isNetworkError(error)) {
      this.handleNetworkError();
      return;
    }

    // Handle other errors
    this.handleGenericError(error, context);
  }

  public static isAuthenticationError(error: any): boolean {
    return (
      error?.message?.includes('Authentication expired') ||
      error?.message === 'AUTH_EXPIRED' ||
      error?.message?.includes('AUTH_EXPIRED') ||
      error?.body?.code === 'AUTH_EXPIRED' ||
      error?.body?.requires_relogin ||
      error?.code === 'AUTH_EXPIRED' ||
      error?.requires_relogin === true ||
      error?.status === 401 ||
      (typeof error === 'string' && error === 'AUTH_EXPIRED') ||
      error?.message?.includes('Token is blacklisted') ||
      error?.message?.includes('Token is expired') ||
      error?.message?.includes('Given token not valid') ||
      error?.message?.includes('Authentication credentials were not provided')
    );
  }

  public static isNetworkError(error: any): boolean {
    return (
      error?.message?.includes('Network connection failed') ||
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('AbortError') ||
      error?.name === 'TypeError' ||
      error instanceof TypeError ||
      error?.isNetworkError === true ||
      error?.type === 'network'
    );
  }

  private static handleAuthenticationError(): void {
    console.log('🔐 Authentication error detected, redirecting to login...');

    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again to continue.',
      [
        {
          text: 'Login',
          onPress: () => {
            if (this.router) {
              // Use replace to prevent going back to authenticated screens
              this.router.replace('/LoginScreen' as any);
            } else {
              console.warn('Router not initialized in ErrorHandler');
            }
          }
        }
      ]
    );
  }

  private static handleNetworkError(): void {
    Alert.alert(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  }

  private static handleGenericError(error: any, context?: string): void {
    const errorMessage = this.getErrorMessage(error);

    Alert.alert(
      'Error',
      errorMessage,
      [{ text: 'OK' }]
    );
  }

  private static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.body?.detail) {
      return error.body.detail;
    }

    if (error?.detail) {
      return error.detail;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  // Utility method to create standardized error objects
  static createError(message: string, code?: string, options?: Partial<AppError>): AppError {
    return {
      message,
      code,
      ...options
    };
  }

  // Method to check if error should be retried
  static shouldRetry(error: any): boolean {
    // Don't retry authentication errors
    if (this.isAuthenticationError(error)) {
      return false;
    }

    // Retry network errors
    if (this.isNetworkError(error)) {
      return true;
    }

    // Retry server errors (5xx)
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }

    // Don't retry client errors (4xx) except 429 (Too Many Requests)
    if (error?.status === 429) {
      return true;
    }

    return false;
  }
}

export default ErrorHandler;
