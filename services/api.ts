// API service for ZoeFit authentication
const API_BASE_URL = __DEV__ ? 'http://10.253.108.221:8000' : 'https://your-production-api.com';

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

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

  async logout(refreshToken: string, accessToken: string): Promise<{ message: string }> {
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
