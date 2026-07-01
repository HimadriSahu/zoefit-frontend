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

// Progress Tracking Interfaces
export interface ProgressData {
  weight?: number;
  workout_streak?: number;
  total_workouts?: number;
  calories_burned?: number;
}

export interface ProgressTracking {
  id: number;
  weight?: number;
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
  approach?: 'ml_based' | 'rule_based' | 'hybrid' | 'emergency_fallback';
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
  private maxRetries: number = 1; // Reduced retries to prevent excessive connection attempts
  private lastWorkingURL: string | null = null;
  private failedURLs: Set<string> = new Set();

  constructor() {
    // Use synchronous URL for immediate initialization
    this.baseURL = getApiBaseUrlSync();
    this.initializeAsync();
  }

  private getEndpointName(endpoint: string): string {
    const endpointMap: Record<string, string> = {
      // Core AI Features endpoints
      '/health-metrics/': 'Health Metrics',
      '/health-metrics/get/': 'Get Health Metrics',
      '/chat/': 'AI Chat',
      '/chat/history/': 'Get Chat History',
      '/progress/': 'Progress Tracking',
      '/progress/update/': 'Update Progress Tracking',
      '/insights/': 'AI Insights',
      '/predict-progress/': 'Predict Progress',

      // Workout module endpoints
      '/preferences/': 'Save Workout Preferences',
      '/preferences/get/': 'Get Workout Preferences',
      '/plans/generate/': 'Generate Workout Plan',
      '/plans/': 'Get Workout Plans',
      '/complete/': 'Update Workout Completion',
      '/sessions/': 'Workout Sessions',
      '/workout/progress/': 'Workout Progress',
      '/plans/adapt/': 'Adapt Workout Plan',

      // Nutrition module endpoints
      '/meal-plans/generate/': 'Generate Meal Plan',
      '/meal-plans/': 'Get Meal Plans',
      '/nutrition/preferences/': 'Save Dietary Preferences',
      '/nutrition/preferences/get/': 'Get Dietary Preferences',
      '/nutrition/logs/': 'Nutrition Logs',
      '/nutrition/logs/log/': 'Log Nutrition',
      '/nutrition/progress/': 'Nutrition Progress',
      '/nutrition/progress/update/': 'Update Nutrition Progress',
      '/foods/search/': 'Search Foods',

      // Frontend endpoints
      '/daily-stats/': 'Daily Stats',
      '/dashboard/': 'Dashboard',
      '/streaks/': 'Streaks',
      '/achievements/': 'Achievements',
      '/users/profile/analytics/': 'Get Profile Analytics',
      '/users/activity/': 'Track Activity',
      '/users/activities/': 'Get Activities',
    };

    return endpointMap[endpoint] || endpoint;
  }

  private getEndpointType(endpoint: string): string {
    if (endpoint.startsWith('/auth/') || endpoint === '/login/' || endpoint === '/register/') {
      return 'Authentication';
    } else if (endpoint.startsWith('/users/')) {
      return 'User Management';
    } else if (endpoint.startsWith('/daily-stats/') || endpoint.startsWith('/dashboard/') ||
      endpoint.startsWith('/achievements/') || endpoint.startsWith('/streaks')) {
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
    const isUsersEndpoint = endpoint.startsWith('/users/') || endpoint.startsWith('/contact/') || endpoint.startsWith('/profile/') || endpoint.startsWith('/onboarding/') || endpoint.startsWith('/activity/');
    const isFrontendEndpoint = endpoint.startsWith('/daily-stats/') || endpoint.startsWith('/dashboard/') ||
      endpoint.startsWith('/achievements/') || endpoint.startsWith('/streaks');
    const isWorkoutEndpoint = endpoint.startsWith('/workout/') || endpoint.startsWith('/sessions/') || endpoint.startsWith('/preferences/') || endpoint.startsWith('/plans/') || endpoint.startsWith('/complete/') || endpoint.startsWith('/workout-');
    const isNutritionEndpoint = endpoint.startsWith('/meal-plans/') || endpoint.startsWith('/nutrition/') || endpoint.startsWith('/logs/') || endpoint.startsWith('/foods/') || endpoint.startsWith('/nutrition-');
    const isAIEndpoint = endpoint.startsWith('/health-metrics/') || endpoint.startsWith('/meal-plan/') || endpoint.startsWith('/meal-plans/') || endpoint.startsWith('/chat/') || endpoint.startsWith('/progress/') || endpoint.startsWith('/insights/') || endpoint.startsWith('/analytics/') || endpoint.startsWith('/ml/') || endpoint.startsWith('/predict-') || endpoint.startsWith('/adapt-');

    // Debug logging
    console.log('🔍 Endpoint Debug:', { endpoint, isAuthEndpoint, isUsersEndpoint, isWorkoutEndpoint, isNutritionEndpoint, isFrontendEndpoint });

    let baseUrl: string;
    if (isAuthEndpoint) {
      baseUrl = `${this.baseURL}/api/auth`;
    } else if (isUsersEndpoint) {
      baseUrl = `${this.baseURL}/api/users`;
    } else if (isWorkoutEndpoint) {
      baseUrl = `${this.baseURL}/api/workout`;
    } else if (isNutritionEndpoint) {
      baseUrl = `${this.baseURL}/api/nutrition`;
    } else if (isAIEndpoint) {
      baseUrl = `${this.baseURL}/api/ai`;
    } else if (isFrontendEndpoint) {
      baseUrl = `${this.baseURL}/api/frontend`;
    } else {
      baseUrl = `${this.baseURL}/api/ai`;
    }

    // Remove the prefix from endpoint to avoid duplication
    let cleanEndpoint = endpoint;
    if (isUsersEndpoint) cleanEndpoint = endpoint.replace('/users/', '');
    else if (isWorkoutEndpoint) cleanEndpoint = endpoint.replace('/workout/', '');
    else if (isNutritionEndpoint) cleanEndpoint = endpoint.replace('/nutrition/', '');
    else if (isFrontendEndpoint) cleanEndpoint = endpoint.replace('/frontend/', '');
    else if (isAIEndpoint) cleanEndpoint = endpoint; // AI endpoints like health-metrics don't have prefix to remove
    else if (!isAuthEndpoint) cleanEndpoint = endpoint.replace('/ai/', '');

    const url = isAuthEndpoint ? `${baseUrl}${endpoint.replace('/auth/', '/')}` : `${baseUrl}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;

    console.log('🌐 API Request:', { url, method: options.method || 'GET', useAuth });

    // Add timeout to prevent hanging requests - increased for better reliability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    };

    // Add authorization header if required
    if (useAuth) {
      const token = await this.getAuthToken();
      if (token) {
        // Check if token is close to expiration (proactive refresh)
        try {
          await this.checkAndRefreshTokenIfNeeded(token);
        } catch (refreshError) {
          console.warn('⚠️ Proactive token refresh failed:', refreshError);
          // Continue with current token if refresh fails
        }

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
      clearTimeout(timeoutId);
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
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 15000); // 15 second timeout for retry

            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...config.headers,
                'Authorization': `Bearer ${newToken}`,
              },
              signal: retryController.signal,
            };

            const retryResponse = await fetch(url, retryConfig);
            clearTimeout(retryTimeoutId);
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
      clearTimeout(timeoutId);
      console.error('❌ API Error:', error);

      // Handle abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your connection and try again.', undefined, {
          error: 'Timeout',
          detail: 'The request took too long to complete'
        });
      }

      // Enhanced error handling for different error types
      if (error instanceof ApiError) {
        // If it's already an ApiError, just re-throw it
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          console.warn('🌐 Network error detected, attempting reconnection...');

          // Only retry if we haven't exceeded max retries (reduced to be less aggressive)
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Network error detected, trying to reconnect... (${this.retryCount}/${this.maxRetries})`);

            try {
              const newUrl = await getApiBaseUrl();
              if (newUrl !== this.baseURL) {
                this.baseURL = newUrl;
                console.log('🔄 Retrying with new URL:', this.baseURL);

                // Retry the request with the new URL and timeout
                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => retryController.abort(), 12000); // 12 second timeout

                const retryConfig: RequestInit = {
                  ...config,
                  signal: retryController.signal,
                };

                // Retry the request with the new URL
                let retryBaseUrl: string;
                if (isAuthEndpoint) {
                  retryBaseUrl = `${this.baseURL}/api/auth`;
                } else if (isUsersEndpoint) {
                  retryBaseUrl = `${this.baseURL}/api/users`;
                } else if (isFrontendEndpoint) {
                  retryBaseUrl = `${this.baseURL}/api/frontend`;
                } else {
                  retryBaseUrl = `${this.baseURL}/api/ai`;
                }

                const retryUrl = isAuthEndpoint ? `${retryBaseUrl}${endpoint.replace('/auth/', '/')}` : `${retryBaseUrl}${endpoint}`;
                const response = await fetch(retryUrl, retryConfig);
                clearTimeout(retryTimeoutId);

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

      // Add timeout to prevent hanging - increased for token refresh
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Use the auth endpoint directly for token refresh
        const url = `${this.baseURL}/api/auth/token/refresh/`;
        const config: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
          signal: controller.signal,
        };

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

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
          // If refresh token is also expired/invalid, clear all auth data
          if (response.status === 401) {
            console.log('🚨 Refresh token expired, clearing all auth data');
            await this.clearAuthData();
            this.notifySubscribers(null);
            throw new ApiError('Authentication expired. Please log in again.', 401, {
              code: 'AUTH_EXPIRED',
              detail: 'Your session has expired. Please log in again to continue.',
              requires_relogin: true
            });
          }
          throw new ApiError(data?.detail || data?.error || 'Token refresh failed', response.status, data);
        }

        // Store the new access token
        await AsyncStorage.setItem('access_token', data.access);
        console.log('✅ Access token refreshed successfully');

        // Notify all waiting subscribers
        this.notifySubscribers(data.access);
        return data.access;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.error('❌ Token refresh timed out');
          this.notifySubscribers(null);
          return null;
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);

      // Check for specific blacklist or invalid token errors
      const isBlacklistedError = error?.message?.includes('Token is blacklisted') ||
        error?.message?.includes('Token is invalid') ||
        error?.message?.includes('Given token not valid') ||
        error?.message?.includes('Invalid token') ||
        error?.message?.includes('Token is expired') ||
        error?.status === 401;

      const isNetworkError = error?.message?.includes('Network request failed') ||
        error?.message?.includes('fetch') ||
        error?.name === 'TypeError' ||
        error instanceof TypeError;

      if (isBlacklistedError) {
        console.log('🧹 Token is invalid/blacklisted, clearing all auth data');
        // Clear tokens on genuine auth failure and force re-login
        await this.clearAuthData();
        // Notify all subscribers that refresh failed
        this.notifySubscribers(null);
        // Throw a specific error that can be caught by UI components
        throw new ApiError('Authentication expired. Please log in again.', 401, {
          code: 'AUTH_EXPIRED',
          detail: 'Your session has expired. Please log in again to continue.',
          requires_relogin: true
        });
      } else if (isNetworkError) {
        console.log('⚠️ Token refresh failed due to network issues, keeping existing tokens');
        // For network issues, don't clear tokens and let retry mechanism handle it
        this.notifySubscribers(null);
        return null;
      } else {
        console.log('⚠️ Token refresh failed due to unknown error');
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
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Invalid JWT token format');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;

      // Refresh if token expires within 5 minutes (300 seconds) or is already expired
      if (timeUntilExpiry < 300 || timeUntilExpiry < 0) {
        console.log(`⏰ Token expires in ${timeUntilExpiry}s, proactively refreshing...`);
        // If token is already expired, clear it and force re-login
        if (timeUntilExpiry < 0) {
          console.log('🚨 Token already expired, clearing and forcing re-login');
          await this.clearAuthData();
          throw new ApiError('Authentication expired. Please log in again.', 401, {
            code: 'AUTH_EXPIRED',
            detail: 'Your session has expired. Please log in again to continue.',
            requires_relogin: true
          });
        }
        await this.refreshAuthToken();
      } else {
        console.log(`✅ Token valid for ${timeUntilExpiry}s, no refresh needed`);
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
      return await this.request<HealthMetricsResponse>('/health-metrics/get/', {}, true);
    } catch (error: any) {
      console.error('❌ Error fetching health metrics:', error);

      // For any error (network, auth, etc.), return default values to prevent undefined errors
      console.log('📊 Using default health metrics due to error');
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
          target_weight: 70
        }
      };
    }
  }

  // Workout Plans
  async generateWorkoutPlan(): Promise<{ message: string; workout_plan: WorkoutPlan }> {
    return this.request<{ message: string; workout_plan: WorkoutPlan }>('/plans/generate/', {
      method: 'POST',
    }, true);
  }

  async getWorkoutPlans(): Promise<{ workout_plans: WorkoutPlan[] }> {
    return this.request<{ workout_plans: WorkoutPlan[] }>('/plans/', {}, true);
  }

  async updateWorkoutCompletion(data: WorkoutCompletionData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/complete/', {
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

      // Clean and validate data - only include fields that exist in UserProfile model
      const cleanedData = {
        gender: data.gender,
        height: Number(data.height) || null,
        weight: Number(data.weight) || null,
        fitness_goal: data.fitness_goal,
        target_weight: Number(data.target_weight) || null,
        activity_level: data.activity_level || 'moderate',
        workout_duration: Number(data.workout_duration) || null,
        workout_types: Array.isArray(data.workout_types) ? data.workout_types : [],
        dietary_preferences: data.dietary_preferences || {},
        medical_conditions: Array.isArray(data.medical_conditions) ? data.medical_conditions : [],
        allergies: Array.isArray(data.allergies) ? data.allergies : [],
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
  async getContactInfo(): Promise<{ email: string }> {
    const response = await this.request<{ email: string }>('/users/contact/', {}, true);
    return {
      email: response.email
    };
  }

  async uploadProfilePicture(formData: FormData): Promise<{ message: string; profile_picture_url: string }> {
    // For file uploads, we need to handle differently
    const token = await this.getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token available');
    }

    const url = `${this.baseURL}/api/users/profile/picture/upload/`;
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
  async generateMealPlan(data?: MealPlanData): Promise<{ message: string; meal_plan: MealPlan }> {
    try {
      // Always fetch current health metrics for personalization
      const healthMetrics = await this.getHealthMetrics();

      // Combine provided data with current health metrics
      const enhancedData = {
        ...data,
        // Include user-specific health metrics for personalization with proper null checks
        user_height: healthMetrics?.metrics?.height || 170,
        user_weight: healthMetrics?.metrics?.weight || 70,
        user_fitness_goal: healthMetrics?.metrics?.fitness_goal || 'maintenance',
        user_activity_level: healthMetrics?.metrics?.activity_level || 'moderate',
        user_target_weight: healthMetrics?.metrics?.target_weight || healthMetrics?.metrics?.weight || 70,
        user_dietary_preferences: healthMetrics?.metrics?.dietary_preferences || {},
        user_allergies: healthMetrics?.metrics?.allergies || [],
        user_daily_calories: healthMetrics?.metrics?.daily_calories || 2000,
        // Force fresh generation with current data
        refresh_personalization: true,
        generation_timestamp: new Date().toISOString()
      };

      console.log('🍽️ Generating personalized meal plan with user data:', enhancedData);

      return this.request<{ message: string; meal_plan: MealPlan }>('/meal-plan/generate/', {
        method: 'POST',
        body: JSON.stringify(enhancedData),
      }, true);
    } catch (error: any) {
      console.error('❌ Failed to fetch health metrics for meal plan generation:', error);
      // Fallback to basic meal plan generation without personalization
      console.log('🔄 Falling back to basic meal plan generation');
      return this.request<{ message: string; meal_plan: MealPlan }>('/meal-plan/generate/', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          fallback_mode: true,
          generation_timestamp: new Date().toISOString()
        }),
      }, true);
    }
  }

  async getMealPlans(startDate?: string, endDate?: string): Promise<{ meal_plans: MealPlan[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const endpoint = `/meal-plans/${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<{ meal_plans: MealPlan[] }>(endpoint, {}, true);
  }

  async updateMealPlanRating(mealPlanId: string, rating: number, feedback?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/meal-plan/rating/', {
      method: 'POST',
      body: JSON.stringify({ meal_plan_id: mealPlanId, rating, feedback }),
    }, true);
  }

  // ML Feedback System
  async submitMLFeedback(
    mealPlanId: string,
    rating: number,
    helpful: boolean,
    accurate: boolean,
    comments?: string,
    suggestions?: string,
    accepted?: boolean,
    modified?: boolean
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/ml/feedback/', {
      method: 'POST',
      body: JSON.stringify({
        meal_plan_id: mealPlanId,
        rating,
        helpful,
        accurate,
        comments,
        suggestions,
        accepted,
        modified,
        feedback_timestamp: new Date().toISOString()
      }),
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
  async getWorkoutSessions(startDate?: string, endDate?: string, completed?: string): Promise<{ workout_sessions: any[]; count: number; next: string | null; previous: string | null }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (completed) params.append('completed', completed);

    const endpoint = `/sessions/${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<any>(endpoint, {}, true);
  }

  async createWorkoutSession(sessionData: any): Promise<any> {
    return this.request<any>('/sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }, true);
  }

  async updateWorkoutSession(sessionId: number, sessionData: any): Promise<any> {
    return this.request<any>(`/sessions/${sessionId}/`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }, true);
  }

  async deleteWorkoutSession(sessionId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sessions/${sessionId}/`, {
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
