import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, AuthResponse } from './api';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export interface UserData {
  id: number;
  email: string;
  username: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.login({ email, password });
      
      // Store tokens and user data
      await this.storeTokens(response.tokens);
      await this.storeUserData(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.register({
        username,
        email,
        password,
        password2: password,
      });
      
      // Store tokens and user data
      await this.storeTokens(response.tokens);
      await this.storeUserData(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();
      const accessToken = await this.getAccessToken();
      if (refreshToken && accessToken) {
        await apiService.logout(refreshToken, accessToken);
      }
    } catch (error) {
      // Continue with local logout even if server logout fails
      console.warn('Server logout failed:', error);
    } finally {
      // Always clear local storage
      await this.clearStorage();
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.refreshToken(refreshToken);
      
      // Store new access token
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.access);
      
      return response.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, clear storage and force re-login
      await this.clearStorage();
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const user = await this.getUserData();
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  private async storeTokens(tokens: { access: string; refresh: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  private async storeUserData(user: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  private async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const authService = new AuthService();
