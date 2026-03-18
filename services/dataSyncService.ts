// Data synchronization service for ZoeFit
import { apiService } from './api';
import { authService } from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DataSyncService {
  private static instance: DataSyncService;

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // Verify that backend has received all essential data
  async verifyBackendSync(): Promise<{ synced: boolean; missing: string[] }> {
    const missing: string[] = [];

    try {
      console.log('🔍 Verifying backend data synchronization...');

      // Check 1: User profile exists
      try {
        const profile = await apiService.getComprehensiveProfile();
        if (!profile || !profile.id) {
          missing.push('user_profile');
        }
      } catch (error) {
        missing.push('user_profile');
      }

      // Check 2: Health metrics exist
      try {
        const healthMetrics = await apiService.getHealthMetrics();
        if (!healthMetrics || !healthMetrics.metrics || !healthMetrics.metrics.height || !healthMetrics.metrics.weight) {
          missing.push('health_metrics');
        }
      } catch (error) {
        missing.push('health_metrics');
      }

      // Check 3: Onboarding status
      try {
        const onboardingStatus = await apiService.getOnboardingStatus();
        if (!onboardingStatus || !onboardingStatus.completed) {
          missing.push('onboarding_completion');
        }
      } catch (error) {
        // Onboarding status endpoint might not exist, which is okay
      }

      // Check 4: Local storage consistency
      const hasLocalOnboarding = await authService.hasCompletedOnboarding();
      const hasAuthTokens = !!(await authService.getAccessToken());

      if (!hasLocalOnboarding) {
        missing.push('local_onboarding_status');
      }

      if (!hasAuthTokens) {
        missing.push('auth_tokens');
      }

      const synced = missing.length === 0;

      console.log(`✅ Backend sync verification complete: ${synced ? 'SYNCED' : 'MISSING DATA'}`);
      if (!synced) {
        console.warn('⚠️ Missing data items:', missing);
      }

      return { synced, missing };

    } catch (error) {
      console.error('❌ Backend sync verification failed:', error);
      return { synced: false, missing: ['verification_failed'] };
    }
  }

  // Force sync all local data to backend
  async forceSyncToBackend(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      console.log('🔄 Starting forced data synchronization...');

      // Get all local onboarding data
      const onboardingDataStr = await AsyncStorage.getItem('onboardingData');
      if (onboardingDataStr) {
        try {
          const onboardingData = JSON.parse(onboardingDataStr);

          // Submit to backend
          await apiService.submitOnboardingData(onboardingData);
          console.log('✅ Onboarding data synced to backend');
        } catch (error) {
          errors.push('onboarding_sync_failed');
          console.error('❌ Onboarding sync failed:', error);
        }
      }

      // Get user data and update profile
      const userData = await authService.getUserData();
      if (userData) {
        try {
          const profileData = {
            email: userData.email || '',
            profile_picture: userData.profile_picture || '',
          };

          await apiService.updateComprehensiveProfile(profileData);
          console.log('✅ User profile synced to backend');
        } catch (error) {
          errors.push('profile_sync_failed');
          console.error('❌ Profile sync failed:', error);
        }
      }

      // Verify health metrics
      try {
        const healthMetrics = await apiService.getHealthMetrics();
        if (!healthMetrics || !healthMetrics.metrics || !healthMetrics.metrics.height) {
          // Create default health metrics if missing
          const defaultMetrics = {
            height: 170,
            weight: 70,
            fitness_goal: 'maintenance' as const,
            activity_level: 'moderate' as const,
            target_weight: 70,
          };

          await apiService.createOrUpdateHealthMetrics(defaultMetrics);
          console.log('✅ Default health metrics created');
        }
      } catch (error) {
        errors.push('health_metrics_sync_failed');
        console.error('❌ Health metrics sync failed:', error);
      }

      const success = errors.length === 0;

      if (success) {
        console.log('🎉 All data successfully synced to backend');
      } else {
        console.warn('⚠️ Some data failed to sync:', errors);
      }

      return { success, errors };

    } catch (error) {
      console.error('❌ Forced sync failed:', error);
      return { success: false, errors: ['sync_failed'] };
    }
  }

  // Get data sync status for debugging
  async getSyncStatus(): Promise<{
    localOnboarding: boolean;
    authTokens: boolean;
    backendProfile: boolean;
    backendHealthMetrics: boolean;
  }> {
    try {
      const localOnboarding = await authService.hasCompletedOnboarding();
      const authTokens = !!(await authService.getAccessToken());

      let backendProfile = false;
      let backendHealthMetrics = false;

      try {
        const profile = await apiService.getComprehensiveProfile();
        backendProfile = !!(profile && profile.id);
      } catch (error) {
        backendProfile = false;
      }

      try {
        const healthMetrics = await apiService.getHealthMetrics();
        backendHealthMetrics = !!(healthMetrics && healthMetrics.metrics && healthMetrics.metrics.height);
      } catch (error) {
        backendHealthMetrics = false;
      }

      return {
        localOnboarding,
        authTokens,
        backendProfile,
        backendHealthMetrics,
      };

    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      return {
        localOnboarding: false,
        authTokens: false,
        backendProfile: false,
        backendHealthMetrics: false,
      };
    }
  }
}

export const dataSyncService = DataSyncService.getInstance();
