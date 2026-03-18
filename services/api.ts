// API service for ZoeFit authentication and AI features
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

// Health Metrics Interfaces
export interface HealthMetricsData {
  height?: number;
  weight?: number;
  fitness_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'strength';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietary_preferences?: Record<string, any>;
  medical_conditions?: string[];
  allergies?: string[];
  target_weight?: number;
}

export interface HealthMetricsResponse {
  message: string;
  metrics: {
    height: number;
    weight: number;
    bmi: number;
    fitness_goal: string;
    activity_level: string;
    daily_calories: number;
    bmi_category: string;
    dietary_preferences?: Record<string, any>;
    medical_conditions?: string[];
    allergies?: string[];
    target_weight?: number;
  };
}

// Workout Interfaces
export interface WorkoutCompletionData {
  workout_plan_id: number | null;
  completed: boolean;
  completion_time?: string;
  completion_time_minutes?: number;
  calories_burned?: number;
  rating?: number;
  user_rating?: number;
  exercises_completed?: any[];
  workout_type?: string; // Add workout type for default workouts
}

export interface WorkoutPlan {
  id: number;
  day: number;
  exercises: any[];
  workout_type: string;
  estimated_duration: number;
  difficulty_level: string;
  intensity_score: number;
  equipment_needed: string[];
  completed: boolean;
  completion_time?: string;
  user_rating?: number;
  created_at: string;
}

// AI Chatbot Interfaces
export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  intent: string;
  confidence: number;
  suggestions: string[];
  timestamp: string;
  ai_provider: string;
}

export interface ChatHistory {
  id: number;
  user_message: string;
  ai_response: string;
  intent_detected: string;
  confidence_score: number;
  helpful?: boolean;
  created_at: string;
}

// User Profile Interfaces
export interface UserProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  height?: number;
  weight?: number;
  fitness_goal?: string;
}

export interface UserProfileResponse {
  message: string;
  profile: {
    id: number;
    user: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    date_of_birth: string;
    profile_picture: string;
    bio: string;
    location: string;
    height: number;
    weight: number;
    fitness_goal: string;
    created_at: string;
    updated_at: string;
  };
}

// Daily Stats Interfaces
export interface DailyStats {
  date: string;
  calories_burned: number;
  workout_minutes: number;
  estimated_steps: number;
  workouts_completed: number;
  total_workout_sessions: number;
  last_updated: string;
}

// Workout Preferences Interfaces
export interface WorkoutPreferencesData {
  equipment_needed: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  workout_type_preference: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';
}

export interface WorkoutPreferencesResponse {
  message: string;
  preferences: WorkoutPreferencesData;
}

// Progress Tracking Interfaces
export interface ProgressData {
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  workout_streak?: number;
  total_workouts?: number;
  calories_burned?: number;
}

export interface ProgressTracking {
  id: number;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  workout_streak: number;
  total_workouts: number;
  calories_burned: number;
  progress_score: number;
  achievement_badges: string[];
  ai_insights: string;
  created_at: string;
}

// Nutrition Interfaces
export interface MealPlanData {
  date?: string;
  meals?: any;
  total_calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealPlan {
  id: number;
  date: string;
  meals: any;
  total_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  generated_by_ai: boolean;
  confidence_score: number;
  user_rating?: number;
  user_feedback?: string;
}

export class ApiError extends Error {
  status?: number;
  body?: any;

  constructor(message: string, status?: number, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    // Maintain proper stack (required for some RN environments)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }
}

class ApiService {
  private baseURL: string;
  private baseURLSet: boolean = false;
  private isInitialized: boolean = false;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];
  private retryCount: number = 0;
  private maxRetries: number = 2;
  private lastWorkingURL: string | null = null;
  private failedURLs: Set<string> = new Set();

  constructor() {
    // Use synchronous URL for immediate initialization
    this.baseURL = getApiBaseUrlSync();
    this.initializeAsync();
  }

  // Helper methods for enhanced error handling
  private getEndpointName(endpoint: string): string {
    const endpointMap: Record<string, string> = {
      '/health-metrics/': 'Health Metrics',
      '/health-metrics/get/': 'Get Health Metrics',
      '/workout-preferences/': 'Save Workout Preferences',
      '/workout-preferences/get/': 'Get Workout Preferences',
      '/workout-plan/generate/': 'Generate Workout Plan',
      '/workout-plans/': 'Get Workout Plans',
      '/workout-complete/': 'Update Workout Completion',
      '/meal-plan/generate/': 'Generate Meal Plan',
      '/meal-plans/': 'Get Meal Plans',
      '/chat/': 'AI Chat',
      '/chat/history/': 'Chat History',
      '/progress/': 'Progress Tracking',
      '/predict-progress/': 'Predict Progress',
      '/insights/': 'AI Insights',
      '/adapt-workout/': 'Adapt Workout Plan',
      '/analytics/user/': 'User Analytics',
      '/daily-stats/': 'Daily Stats',
      '/workout-sessions/': 'Workout Sessions',
      '/dashboard/': 'Dashboard',
      '/streaks/': 'Streaks',
      '/achievements/': 'Achievements',
      '/profiles/profile/': 'User Profile',
      '/profiles/profile/create/': 'Create Profile',
      '/profiles/profile/update/': 'Update Profile',
      '/profiles/profile/upload-picture/': 'Upload Profile Picture',
      '/profiles/contact-info/': 'Get Contact Information',
      '/profiles/contact-info/update/': 'Update Contact Information',
    };

    return endpointMap[endpoint] || endpoint;
  }

  private getEndpointType(endpoint: string): string {
    if (endpoint.startsWith('/auth/') || endpoint === '/login/' || endpoint === '/register/') {
      return 'Authentication';
    } else if (endpoint.startsWith('/profiles/')) {
      return 'User Profile';
    } else if (endpoint.startsWith('/daily-stats/') || endpoint.startsWith('/workout-sessions/') ||
      endpoint.startsWith('/dashboard/') || endpoint.startsWith('/achievements/') ||
      endpoint.startsWith('/streaks/')) {
      return 'Frontend Features';
    } else {
      return 'AI Features';
    }
  }

  // Async initialization to find the best working URL
  private async initializeAsync() {
    try {
      // If we have a working URL from before, try it first but verify it still works
      if (this.lastWorkingURL) {
        try {
          const testUrl = `${this.lastWorkingURL}/api/auth/login/`;
          const testResponse = await fetch(testUrl, {
            method: 'OPTIONS',
            headers: { 'Content-Type': 'application/json' }
          });

          if (testResponse.status === 200 || testResponse.status === 405) {
            this.baseURL = this.lastWorkingURL;
            console.log('✅ Using last known working URL:', this.baseURL);
            this.isInitialized = true;
            return;
          } else {
            console.log('⚠️ Last working URL no longer valid, finding new one');
            this.lastWorkingURL = null;
          }
        } catch (error) {
          console.log('⚠️ Last working URL failed, finding new one');
          this.lastWorkingURL = null;
        }
      }

      const bestUrl = await getApiBaseUrl();
      if (bestUrl !== this.baseURL) {
        this.baseURL = bestUrl;
        console.log('🔄 Updated API URL to:', this.baseURL);
      }
      this.isInitialized = true;
      this.retryCount = 0; // Reset retry count on successful initialization
      this.lastWorkingURL = this.baseURL; // Cache the working URL
    } catch (error) {
      console.warn('⚠️ API initialization failed, using fallback URL');
      this.isInitialized = true;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuth: boolean = false
  ): Promise<T> {
    // Wait for initialization if not ready
    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Determine the base URL based on endpoint type
    const isAuthEndpoint = endpoint.startsWith('/auth/') || endpoint === '/login/' || endpoint === '/register/' || endpoint === '/token/refresh/' || endpoint === '/forgot-password/' || endpoint === '/logout/';
    const isProfilesEndpoint = endpoint.startsWith('/profiles/');
    const isUsersEndpoint = endpoint.startsWith('/users/');
    const isFrontendEndpoint = endpoint.startsWith('/daily-stats/') || endpoint.startsWith('/workout-sessions/') || endpoint.startsWith('/dashboard/') || endpoint.startsWith('/achievements/') || endpoint.startsWith('/streaks/') || endpoint.startsWith('/progress-') || endpoint.startsWith('/meal-logs/') || endpoint.startsWith('/nutrition-summary/') || endpoint.startsWith('/workout-stats/');

    let baseUrl: string;
    if (isAuthEndpoint) {
      baseUrl = `${this.baseURL}/api/auth`;
    } else if (isProfilesEndpoint) {
      baseUrl = `${this.baseURL}/api/profiles`;
    } else if (isUsersEndpoint) {
      baseUrl = `${this.baseURL}/api/users`;
    } else if (isFrontendEndpoint) {
      baseUrl = `${this.baseURL}/api/frontend`;
    } else {
      baseUrl = `${this.baseURL}/api/ai`;
    }

    const url = isAuthEndpoint ? `${baseUrl}${endpoint.replace('/auth/', '/')}` : isProfilesEndpoint ? `${baseUrl}${endpoint}` : isUsersEndpoint ? `${baseUrl}${endpoint}` : `${baseUrl}${endpoint}`;

    console.log('🌐 API Request:', { url, method: options.method || 'GET', useAuth });

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if required
    if (useAuth) {
      const token = await this.getAuthToken();
      if (token) {
        // Check if token is close to expiration (proactive refresh)
        await this.checkAndRefreshTokenIfNeeded(token);
        const freshToken = await this.getAuthToken();
        if (freshToken) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${freshToken}`,
          };
        }
      } else {
        console.warn('🚨 No auth token available for protected endpoint');
      }
    }

    console.log('🔧 Request Config:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      console.log('📡 API Response Status:', response.status);

      let data: any;
      const contentType = response.headers.get('content-type');
      try {
        const text = await response.text();
        if (text && contentType?.includes('application/json')) {
          data = JSON.parse(text);
        } else {
          data = text ? { detail: text.slice(0, 200) } : {};
        }
      } catch (_) {
        data = { detail: 'Invalid response from server' };
      }
      console.log('📊 API Response Data:', data);

      if (!response.ok) {
        // If we get a 401 (Unauthorized) and this is an authenticated request, try to refresh the token
        if (response.status === 401 && useAuth) {
          console.log('🔐 Got 401, attempting token refresh...');
          const newToken = await this.refreshAuthToken();

          if (newToken) {
            console.log('🔄 Retrying request with new token...');
            // Retry the request with the new token
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...config.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            };

            const retryResponse = await fetch(url, retryConfig);
            console.log('📡 Retry Response Status:', retryResponse.status);

            let retryData: any;
            try {
              const retryText = await retryResponse.text();
              if (retryText && retryResponse.headers.get('content-type')?.includes('application/json')) {
                retryData = JSON.parse(retryText);
              } else {
                retryData = retryText ? { detail: retryText.slice(0, 200) } : {};
              }
            } catch (_) {
              retryData = { detail: 'Invalid response from server' };
            }
            console.log('📊 Retry Response Data:', retryData);

            if (!retryResponse.ok) {
              const msg = retryData?.detail || retryData?.error || JSON.stringify(retryData) || `HTTP ${retryResponse.status}`;
              throw new ApiError(msg, retryResponse.status, retryData);
            }

            return retryData as T;
          } else {
            console.log('❌ Token refresh failed, user needs to re-login');
            // Throw a specific error that the app can catch and handle
            throw new ApiError('Authentication expired. Please log in again.', 401, {
              code: 'AUTH_EXPIRED',
              detail: 'Your session has expired. Please log in again to continue.'
            });
          }
        }

        const msg = data?.detail || data?.error || JSON.stringify(data) || `HTTP ${response.status}`;

        // Enhanced error handling for specific status codes
        if (response.status === 404) {
          const endpointName = this.getEndpointName(endpoint);
          const enhancedMsg = `Endpoint not found: ${endpointName}. This feature may not be available yet or the endpoint has changed.`;
          console.warn(`🔍 404 Error - ${enhancedMsg}`);
          throw new ApiError(enhancedMsg, response.status, { ...data, endpoint_type: this.getEndpointType(endpoint) });
        } else if (response.status === 500) {
          const enhancedMsg = `Server error occurred. Please try again later. If the problem persists, contact support.`;
          console.error(`🔥 500 Error - ${enhancedMsg}`);
          throw new ApiError(enhancedMsg, response.status, data);
        } else if (response.status === 429) {
          const enhancedMsg = `Too many requests. Please wait a moment before trying again.`;
          console.warn(`⏱️ 429 Error - ${enhancedMsg}`);
          throw new ApiError(enhancedMsg, response.status, data);
        }

        throw new ApiError(msg, response.status, data);
      }

      return data as T;
    } catch (error) {
      console.error('❌ API Error:', error);

      // Enhanced error handling for different error types
      if (error instanceof ApiError) {
        // If it's already an ApiError, just re-throw it
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          console.warn('🌐 Network error detected, attempting reconnection...');

          // Only retry if we haven't exceeded max retries
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Network error detected, trying to reconnect... (${this.retryCount}/${this.maxRetries})`);

            try {
              const newUrl = await getApiBaseUrl();
              if (newUrl !== this.baseURL) {
                this.baseURL = newUrl;
                console.log('🔄 Retrying with new URL:', this.baseURL);

                // Retry the request with the new URL
                let retryBaseUrl: string;
                if (isAuthEndpoint) {
                  retryBaseUrl = `${this.baseURL}/api/auth`;
                } else if (isProfilesEndpoint) {
                  retryBaseUrl = `${this.baseURL}/api/profiles`;
                } else if (isFrontendEndpoint) {
                  retryBaseUrl = `${this.baseURL}/api/frontend`;
                } else {
                  retryBaseUrl = `${this.baseURL}/api/ai`;
                }

                const retryUrl = isAuthEndpoint ? `${retryBaseUrl}${endpoint.replace('/auth/', '/')}` : `${retryBaseUrl}${endpoint}`;
                const response = await fetch(retryUrl, config);
                const text = await response.text();
                let data: any = {};
                try {
                  if (text && response.headers.get('content-type')?.includes('application/json')) {
                    data = JSON.parse(text);
                  }
                } catch (_) {
                  data = {};
                }
                if (!response.ok) {
                  const msg = data?.detail || data?.error || JSON.stringify(data) || `HTTP ${response.status}`;
                  throw new ApiError(msg, response.status, data);
                }

                // Reset retry count on successful retry
                this.retryCount = 0;
                this.lastWorkingURL = this.baseURL; // Cache the successful URL
                this.failedURLs.clear(); // Clear failed URLs on success
                return data as T;
              }
            } catch (retryError) {
              console.error('❌ Retry failed:', retryError);
            }
          } else {
            console.warn('⚠️ Max retries reached, giving up');
            this.retryCount = 0; // Reset for future requests
          }

          // If we're here, all retries failed
          throw new ApiError('Network connection failed. Please check your internet connection and try again.', undefined, {
            error: 'Network error',
            detail: error.message,
            retry_count: this.retryCount
          });
        } else if (error.message.includes('AbortError')) {
          throw new ApiError('Request timed out. Please check your connection and try again.', undefined, {
            error: 'Timeout',
            detail: error.message
          });
        }
      }

      // Generic error fallback
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

      let data: any;
      try {
        const text = await response.text();
        data = (text && response.headers.get('content-type')?.includes('application/json'))
          ? JSON.parse(text)
          : {};
      } catch (_) {
        data = {};
      }
      console.log('📊 Logout Response Data:', data);

      if (!response.ok) {
        throw new ApiError(data.message || 'API Error', response.status, data);
      }

      return data as { message: string };
    } catch (error) {
      console.error('❌ Logout Error:', error);
      if (error instanceof Error) {
        throw new ApiError('Network error', undefined, {
          error: 'Network error',
          detail: error.message,
        });
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

  // Helper method to get auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try to get token from AsyncStorage (React Native)
      let AsyncStorage;
      try {
        AsyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (importError) {
        console.warn('⚠️ AsyncStorage not available:', importError);
        return null;
      }

      let token = await AsyncStorage.getItem('access_token');
      console.log('🔑 Retrieved token:', token ? '✅ Token exists' : '❌ No token found');

      // If no token, return null
      if (!token) {
        return null;
      }

      return token;
    } catch (error) {
      console.warn('❌ Could not retrieve auth token:', error);
      return null;
    }
  }

  // Helper method to clear all authentication data
  async clearAuthData(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data', 'onboarding_completed']);
      console.log('🧹 Cleared all auth tokens and user data');
    } catch (error) {
      console.warn('⚠️ Could not clear auth data:', error);
    }
  }

  // Helper method to refresh access token with queuing
  private async refreshAuthToken(): Promise<string | null> {
    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshing) {
      console.log('⏳ Token refresh already in progress, waiting...');
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string | null) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      let AsyncStorage;
      try {
        AsyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (importError) {
        console.warn('⚠️ AsyncStorage not available:', importError);
        this.notifySubscribers(null);
        return null;
      }

      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.warn('❌ No refresh token available');
        this.notifySubscribers(null);
        return null;
      }

      console.log('🔄 Refreshing access token...');

      // Use the auth endpoint directly for token refresh
      const url = `${this.baseURL}/api/auth/token/refresh/`;
      const config: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      };

      const response = await fetch(url, config);
      console.log('📡 Token Refresh Response Status:', response.status);

      let data: any;
      try {
        const text = await response.text();
        if (text && response.headers.get('content-type')?.includes('application/json')) {
          data = JSON.parse(text);
        } else {
          data = text ? { detail: text.slice(0, 200) } : {};
        }
      } catch (_) {
        data = { detail: 'Invalid response from server' };
      }
      console.log('📊 Token Refresh Response Data:', data);

      if (!response.ok) {
        throw new ApiError(data?.detail || data?.error || 'Token refresh failed', response.status, data);
      }

      // Store the new access token
      await AsyncStorage.setItem('access_token', data.access);
      console.log('✅ Access token refreshed successfully');

      // Notify all waiting subscribers
      this.notifySubscribers(data.access);
      return data.access;
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);

      // Check for specific blacklist or invalid token errors
      const isBlacklistedError = error?.message?.includes('Token is blacklisted') ||
        error?.message?.includes('Token is invalid') ||
        error?.message?.includes('Given token not valid') ||
        error?.message?.includes('Invalid token') ||
        error?.status === 401;

      if (isBlacklistedError) {
        console.log('🧹 Token is invalid/blacklisted, clearing all auth data');
        // Clear tokens on genuine auth failure and force re-login
        await this.clearAuthData();
        // Notify all subscribers that refresh failed
        this.notifySubscribers(null);
        return null;
      } else {
        console.log('⚠️ Token refresh failed due to network issues, keeping existing tokens');
        // For network issues, don't clear tokens and let retry mechanism handle it
        this.notifySubscribers(null);
        return null;
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  // Helper method to notify all subscribers of token refresh result
  private notifySubscribers(token: string | null): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  // Helper method to check token expiration and refresh proactively
  private async checkAndRefreshTokenIfNeeded(token: string): Promise<void> {
    try {
      // Parse JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;

      // Refresh if token expires within 5 minutes (300 seconds)
      if (timeUntilExpiry < 300) {
        console.log('⏰ Token expires soon, proactively refreshing...');
        await this.refreshAuthToken();
      }
    } catch (error) {
      console.warn('⚠️ Could not parse token for expiration check:', error);
      // If we can't parse the token, don't attempt refresh
    }
  }

  // ============= AI FEATURES API =============

  // Health Metrics
  async createOrUpdateHealthMetrics(data: HealthMetricsData): Promise<HealthMetricsResponse> {
    return this.request<HealthMetricsResponse>('/health-metrics/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getHealthMetrics(): Promise<HealthMetricsResponse> {
    try {
      return await this.request<HealthMetricsResponse>('/health-metrics/get/');
    } catch (error: any) {
      // If no health metrics found, return default values
      if (error.status === 404 ||
        error.message?.includes('No HealthMetrics matches') ||
        error.message?.includes('Health metrics not found') ||
        error.message?.includes('health profile')) {
        console.log('📊 No health metrics found, using defaults');
        return {
          message: 'Default health metrics',
          metrics: {
            height: 170,
            weight: 70,
            bmi: 24.2,
            fitness_goal: 'maintenance',
            activity_level: 'moderate',
            daily_calories: 2000,
            bmi_category: 'Normal',
            dietary_preferences: {},
            medical_conditions: [],
            allergies: [],
            target_weight: undefined
          }
        };
      }
      throw error;
    }
  }

  // Workout Plans
  async generateWorkoutPlan(): Promise<{ message: string; workout_plan: WorkoutPlan }> {
    return this.request<{ message: string; workout_plan: WorkoutPlan }>('/workout-plan/generate/', {
      method: 'POST',
    }, true);
  }

  async getWorkoutPlans(): Promise<{ workout_plans: WorkoutPlan[] }> {
    return this.request<{ workout_plans: WorkoutPlan[] }>('/workout-plans/', {}, true);
  }

  async updateWorkoutCompletion(data: WorkoutCompletionData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/workout-complete/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  // AI Chatbot
  async sendChatMessage(data: ChatMessage): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getChatHistory(): Promise<{ chat_history: ChatHistory[] }> {
    return this.request<{ chat_history: ChatHistory[] }>('/chat/history/', {}, true);
  }

  async deleteChatHistory(chatId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/chat/history/${chatId}/`, {
      method: 'DELETE',
    }, true);
  }

  async markChatHelpful(chatId: number, helpful: boolean): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/chat/history/${chatId}/helpful/`, {
      method: 'PATCH',
      body: JSON.stringify({ helpful }),
    }, true);
  }

  // ============= USER PROFILE API =============

  // Comprehensive User Profile Methods
  async getComprehensiveProfile(): Promise<any> {
    return this.request<any>('/users/profile/', {}, true);
  }

  async updateComprehensiveProfile(data: any): Promise<any> {
    return this.request<any>('/users/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
  }

  async submitOnboardingData(data: any): Promise<any> {
    try {
      // Validate required fields before submission
      const requiredFields = ['gender', 'height', 'weight', 'fitness_goal'];
      const missingFields = requiredFields.filter(field => !data[field]);

      if (missingFields.length > 0) {
        console.warn('⚠️ Missing required onboarding fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Clean and validate data
      const cleanedData = {
        gender: data.gender,
        date_of_birth: data.date_of_birth || null,
        height: Number(data.height) || null,
        weight: Number(data.weight) || null,
        fitness_goal: data.fitness_goal,
        target_weight: Number(data.target_weight) || null,
        activity_level: data.activity_level || 'moderate',
        breakfast_time: data.breakfast_time || null,
        dinner_time: data.dinner_time || null,
        phone_number: data.phone_number || null,
        bio: data.bio || null,
        location: data.location || null,
        dietary_preferences: data.dietary_preferences || {},
        medical_conditions: Array.isArray(data.medical_conditions) ? data.medical_conditions : [],
        allergies: Array.isArray(data.allergies) ? data.allergies : [],
        difficulty_level: data.difficulty_level || 'beginner',
        workout_type_preference: data.workout_type_preference || 'mixed',
        body_fat_percentage: Number(data.body_fat_percentage) || null,
        muscle_mass: Number(data.muscle_mass) || null,
      };

      console.log('📤 Submitting validated onboarding data:', cleanedData);

      const response = await this.request<any>('/users/onboarding/', {
        method: 'POST',
        body: JSON.stringify(cleanedData),
      }, true);

      console.log('✅ Onboarding data submitted successfully');
      return response;
    } catch (error) {
      console.error('❌ Onboarding data submission failed:', error);
      throw error;
    }
  }

  async getOnboardingStatus(): Promise<any> {
    return this.request<any>('/users/onboarding/status/', {}, true);
  }

  async deleteProfilePicture(): Promise<any> {
    return this.request<any>('/users/profile/picture/delete/', {
      method: 'DELETE',
    }, true);
  }

  async getProfileAnalytics(): Promise<any> {
    return this.request<any>('/users/profile/analytics/', {}, true);
  }

  async trackActivity(): Promise<any> {
    return this.request<any>('/users/activity/', {
      method: 'POST',
    }, true);
  }

  // Legacy User Profile Methods (for backward compatibility)
  async createOrUpdateUserProfile(data: UserProfileData): Promise<UserProfileResponse> {
    // Map to comprehensive user profile
    const comprehensiveData = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      bio: data.bio,
      location: data.location,
      profile_picture: data.profile_picture,
      fitness_goal: data.fitness_goal,
    };

    return this.updateComprehensiveProfile(comprehensiveData);
  }

  async getUserProfile(): Promise<UserProfileResponse> {
    const profile = await this.getComprehensiveProfile();

    // Map comprehensive profile back to legacy format
    return {
      message: "Profile retrieved successfully",
      profile: {
        id: profile.id,
        user: profile.user,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        date_of_birth: profile.date_of_birth,
        profile_picture: profile.profile_picture,
        bio: profile.bio,
        location: profile.location,
        fitness_goal: profile.fitness_goal,
        height: profile.height,
        weight: profile.weight,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    };
  }

  // Contact Information Specific Methods
  async getContactInfo(): Promise<{ phone_number: string | null; email: string }> {
    const profile = await this.getComprehensiveProfile();
    return {
      phone_number: profile.phone_number,
      email: profile.email || '', // Email comes from user model
    };
  }

  async updateContactInfo(phoneNumber: string): Promise<{ message: string; contact_info: { phone_number: string; email: string } }> {
    await this.updateComprehensiveProfile({ phone_number: phoneNumber });
    const contactInfo = await this.getContactInfo();
    return {
      message: 'Contact information updated successfully',
      contact_info: {
        phone_number: contactInfo.phone_number || 'NA',
        email: contactInfo.email
      }
    };
  }

  async uploadProfilePicture(formData: FormData): Promise<{ message: string; profile_picture_url: string }> {
    // For file uploads, we need to handle differently
    const token = await this.getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token available');
    }

    const url = `${this.baseURL}/api/profiles/profile/upload-picture/`;
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const text = await response.text();
    let data: any;
    try {
      data = response.headers.get('content-type')?.includes('application/json')
        ? JSON.parse(text)
        : { message: text };
    } catch (_) {
      data = { message: text };
    }

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data);
    }

    return data;
  }

  // Workout Preferences
  async saveWorkoutPreferences(data: WorkoutPreferencesData): Promise<WorkoutPreferencesResponse> {
    return this.request<WorkoutPreferencesResponse>('/workout-preferences/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getWorkoutPreferences(): Promise<WorkoutPreferencesResponse> {
    return this.request<WorkoutPreferencesResponse>('/workout-preferences/get/', {}, true);
  }

  // Progress Tracking
  async getProgressTracking(): Promise<{ progress_data: ProgressTracking[] }> {
    return this.request<{ progress_data: ProgressTracking[] }>('/progress/', {}, true);
  }

  async createProgressEntry(progressData: any): Promise<{ message: string }> {
    return this.request<{ message: string }>('/progress/create/', {
      method: 'POST',
      body: JSON.stringify(progressData),
    }, true);
  }

  async predictProgress(): Promise<{ prediction: any; insights: string[] }> {
    return this.request<{ prediction: any; insights: string[] }>('/predict-progress/', {}, true);
  }

  async getAIInsights(): Promise<{ insights: string[]; recommendations: string[] }> {
    return this.request<{ insights: string[]; recommendations: string[] }>('/insights/', {}, true);
  }

  // Nutrition & Meal Plans
  async generateMealPlan(): Promise<{ message: string; meal_plan: MealPlan }> {
    return this.request<{ message: string; meal_plan: MealPlan }>('/meal-plan/generate/', {
      method: 'POST',
    }, true);
  }

  async getMealPlans(): Promise<{ meal_plans: MealPlan[] }> {
    return this.request<{ meal_plans: MealPlan[] }>('/meal-plans/', {}, true);
  }

  async updateMealPlanRating(mealPlanId: string, rating: number, feedback?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/meal-plan/rating/', {
      method: 'POST',
      body: JSON.stringify({ meal_plan_id: mealPlanId, rating, feedback }),
    }, true);
  }

  // Advanced AI Features
  async adaptWorkoutPlan(workoutPlanId: number, feedback: string): Promise<{ message: string; adapted_workout: WorkoutPlan }> {
    return this.request<{ message: string; adapted_workout: WorkoutPlan }>('/adapt-workout/', {
      method: 'POST',
      body: JSON.stringify({ workout_plan_id: workoutPlanId, feedback }),
    }, true);
  }

  // Analytics
  async getUserAnalytics(): Promise<{ analytics: any; trends: any }> {
    return this.request<{ analytics: any; trends: any }>('/analytics/user/', {}, true);
  }

  // ============= FRONTEND FEATURES API =============

  // Daily Stats for Home Screen
  async getDailyStats(): Promise<DailyStats> {
    return this.request<DailyStats>('/daily-stats/', {}, true);
  }

  // Workout Session Management
  async getWorkoutSessions(startDate?: string, endDate?: string, completed?: string): Promise<{ results: any[]; count: number; next: string | null; previous: string | null }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (completed) params.append('completed', completed);

    const endpoint = `/workout-sessions/${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<any>(endpoint, {}, true);
  }

  async createWorkoutSession(sessionData: any): Promise<any> {
    return this.request<any>('/workout-sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }, true);
  }

  async updateWorkoutSession(sessionId: number, sessionData: any): Promise<any> {
    return this.request<any>(`/workout-sessions/${sessionId}/`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }, true);
  }

  async deleteWorkoutSession(sessionId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workout-sessions/${sessionId}/`, {
      method: 'DELETE',
    }, true);
  }

  // Dashboard Data
  async getDashboardSummary(): Promise<any> {
    return this.request<any>('/dashboard/', {}, true);
  }

  // Streaks
  async getStreaks(): Promise<any[]> {
    return this.request<any[]>('/streaks/', {}, true);
  }

  // Achievements
  async getAchievements(displayed?: string): Promise<{ results: any[]; count: number; next: string | null; previous: string | null }> {
    const params = displayed ? `?displayed=${displayed}` : '';
    return this.request<any>(`/achievements/${params}`, {}, true);
  }
}

export const apiService = new ApiService();
