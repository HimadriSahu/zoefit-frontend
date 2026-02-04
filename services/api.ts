// API service for ZoeFit authentication
import { getApiBaseUrl, getApiBaseUrlSync } from '../config/apiConfig';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: any;
}

class ApiService {
  private baseURL: string;
  private isInitialized: boolean = false;

  constructor() {
    // Use synchronous URL for immediate initialization
    this.baseURL = getApiBaseUrlSync();
    this.initializeAsync();
  }

  // Async initialization to find the best working URL
  private async initializeAsync() {
    try {
      const bestUrl = await getApiBaseUrl();
      if (bestUrl !== this.baseURL) {
        this.baseURL = bestUrl;
        console.log('🔄 Updated API URL to:', this.baseURL);
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('⚠️ API initialization failed, using fallback URL');
      this.isInitialized = true;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Wait for initialization if not ready
    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const url = `${this.baseURL}/api/auth${endpoint}`;
    
    console.log('🌐 API Request:', { url, method: options.method || 'GET' });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('🔧 Request Config:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      console.log('📡 API Response Status:', response.status);
      
      const data = await response.json();
      console.log('📊 API Response Data:', data);

      if (!response.ok) {
        throw {
          status: response.status,
          ...data,
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      console.error('❌ API Error:', error);
      
      // If it's a network error, try to reconnect with a different URL
      if (error instanceof Error && error.message.includes('Network request failed')) {
        console.log('🔄 Network error detected, trying to reconnect...');
        try {
          const newUrl = await getApiBaseUrl();
          if (newUrl !== this.baseURL) {
            this.baseURL = newUrl;
            console.log('🔄 Retrying with new URL:', this.baseURL);
            
            // Retry the request with the new URL
            const retryUrl = `${this.baseURL}/api/auth${endpoint}`;
            const response = await fetch(retryUrl, config);
            const data = await response.json();
            
            if (!response.ok) {
              throw {
                status: response.status,
                ...data,
              } as ApiError;
            }
            
            return data as T;
          }
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
        }
      }
      
      if (error instanceof Error) {
        throw {
          error: 'Network error',
          detail: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string; note?: string }> {
    return this.request<{ message: string; note?: string }>('/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout(refreshToken: string, accessToken: string): Promise<{ message: string }> {
    // Wait for initialization if not ready
    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const url = `${this.baseURL}/api/auth/logout/`;
    const body = JSON.stringify({ refresh_token: refreshToken });
    
    console.log('🌐 Logout Request:', { url, method: 'POST' });
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body,
    };

    console.log('🔧 Logout Config:', {
      url,
      method: 'POST',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      console.log('📡 Logout Response Status:', response.status);
      
      const data = await response.json();
      console.log('📊 Logout Response Data:', data);

      if (!response.ok) {
        throw {
          status: response.status,
          ...data,
        } as ApiError;
      }

      return data as { message: string };
    } catch (error) {
      console.error('❌ Logout Error:', error);
      if (error instanceof Error) {
        throw {
          error: 'Network error',
          detail: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  async getProfile(token: string): Promise<any> {
    return this.request('/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return this.request<{ access: string }>('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }
}

export const apiService = new ApiService();
