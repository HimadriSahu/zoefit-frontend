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
    const isFrontendEndpoint = endpoint.startsWith('/daily-stats/') || endpoint.startsWith('/workout-sessions/') || endpoint.startsWith('/dashboard/') || endpoint.startsWith('/achievements/') || endpoint.startsWith('/streaks/') || endpoint.startsWith('/progress-') || endpoint.startsWith('/meal-logs/') || endpoint.startsWith('/nutrition-summary/') || endpoint.startsWith('/workout-stats/');

    let baseUrl: string;
    if (isAuthEndpoint) {
      baseUrl = `${this.baseURL}/api/auth`;
    } else if (isProfilesEndpoint) {
      baseUrl = `${this.baseURL}/api/profiles`;
    } else if (isFrontendEndpoint) {
      baseUrl = `${this.baseURL}/api/frontend`;
    } else {
      baseUrl = `${this.baseURL}/api/ai`;
    }

    const url = isAuthEndpoint ? `${baseUrl}${endpoint.replace('/auth/', '/')}` : isProfilesEndpoint ? `${baseUrl}${endpoint}` : `${baseUrl}${endpoint}`;

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
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
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
        throw new ApiError(msg, response.status, data);
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

            return data as T;
          }
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
        }
      }

      if (error instanceof Error) {
        throw new ApiError(error.message || 'Network error', undefined, { error: error.message });
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

  // Helper method to refresh access token
  private async refreshAuthToken(): Promise<string | null> {
    try {
      let AsyncStorage;
      try {
        AsyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (importError) {
        console.warn('⚠️ AsyncStorage not available:', importError);
        return null;
      }

      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.warn('❌ No refresh token available');
        return null;
      }

      console.log('🔄 Refreshing access token...');
      const response = await this.request<{ access: string }>('/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });

      // Store the new access token
      await AsyncStorage.setItem('access_token', response.access);
      console.log('✅ Access token refreshed successfully');

      return response.access;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear tokens on refresh failure and force re-login
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data', 'onboarding_completed']);
        console.log('🧹 Cleared all auth tokens and user data due to token refresh failure');
      } catch (clearError) {
        console.warn('⚠️ Could not clear tokens:', clearError);
      }
      return null;
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
    return this.request<HealthMetricsResponse>('/health-metrics/get/', {}, true);
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

  // User Profile
  async createOrUpdateUserProfile(data: UserProfileData): Promise<UserProfileResponse> {
    try {
      // First try to get existing profile
      const existingProfile = await this.getUserProfile().catch(() => null);

      if (existingProfile) {
        // Update existing profile
        return this.request<UserProfileResponse>('/profiles/profile/update/', {
          method: 'PATCH',
          body: JSON.stringify(data),
        }, true);
      } else {
        // Create new profile
        return this.request<UserProfileResponse>('/profiles/profile/create/', {
          method: 'POST',
          body: JSON.stringify(data),
        }, true);
      }
    } catch (error) {
      console.error('❌ Profile operation failed:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/profiles/profile/', {}, true);
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
