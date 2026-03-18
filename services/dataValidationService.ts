// Data validation service to verify frontend-backend consistency
import { apiService } from './api';
import { authService } from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DataValidationService {
  private static instance: DataValidationService;

  static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  // Comprehensive data validation
  async validateAllData(): Promise<{
    isValid: boolean;
    issues: Array<{
      type: 'error' | 'warning';
      field: string;
      message: string;
      frontendValue: any;
      backendValue: any;
    }>;
  }> {
    const issues = [];

    try {
      console.log('🔍 Starting comprehensive data validation...');

      // Get frontend data
      const frontendData = await this.getFrontendData();

      // Get backend data
      const backendData = await this.getBackendData();

      // Compare critical fields
      const criticalFields = [
        'height', 'weight', 'fitness_goal', 'activity_level',
        'gender', 'date_of_birth', 'target_weight'
      ];

      for (const field of criticalFields) {
        const frontendValue = frontendData[field];
        const backendValue = backendData[field];

        if (frontendValue !== backendValue) {
          issues.push({
            type: 'error' as const,
            field,
            message: `Data mismatch for ${field}`,
            frontendValue,
            backendValue
          });
        }
      }

      // Validate data types and ranges
      if (backendData.height && (backendData.height < 100 || backendData.height > 250)) {
        issues.push({
          type: 'error' as const,
          field: 'height',
          message: 'Height out of valid range (100-250cm)',
          frontendValue: frontendData.height,
          backendValue: backendData.height
        });
      }

      if (backendData.weight && (backendData.weight < 30 || backendData.weight > 300)) {
        issues.push({
          type: 'error' as const,
          field: 'weight',
          message: 'Weight out of valid range (30-300kg)',
          frontendValue: frontendData.weight,
          backendValue: backendData.weight
        });
      }

      // Check for required fields
      const requiredFields = ['height', 'weight', 'fitness_goal'];
      for (const field of requiredFields) {
        if (!backendData[field]) {
          issues.push({
            type: 'error' as const,
            field,
            message: `Required field ${field} is missing in backend`,
            frontendValue: frontendData[field],
            backendValue: null
          });
        }
      }

      // Check onboarding completion consistency
      const frontendOnboarding = await authService.hasCompletedOnboarding();
      const backendOnboarding = backendData.onboarding_completed;

      if (frontendOnboarding !== backendOnboarding) {
        issues.push({
          type: 'warning' as const,
          field: 'onboarding_status',
          message: 'Onboarding status mismatch between frontend and backend',
          frontendValue: frontendOnboarding,
          backendValue: backendOnboarding
        });
      }

      const isValid = issues.filter(i => i.type === 'error').length === 0;

      console.log(`✅ Data validation complete: ${isValid ? 'VALID' : 'ISSUES FOUND'}`);
      if (issues.length > 0) {
        console.warn('⚠️ Data validation issues:', issues);
      }

      return { isValid, issues };

    } catch (error) {
      console.error('❌ Data validation failed:', error);
      return {
        isValid: false,
        issues: [{
          type: 'error' as const,
          field: 'validation',
          message: 'Validation process failed',
          frontendValue: null,
          backendValue: null
        }]
      };
    }
  }

  // Get data stored in frontend (AsyncStorage)
  private async getFrontendData(): Promise<any> {
    try {
      const onboardingDataStr = await AsyncStorage.getItem('onboardingData');
      const onboardingData = onboardingDataStr ? JSON.parse(onboardingDataStr) : {};

      const userData = await authService.getUserData();

      return {
        // From onboarding context
        gender: onboardingData.gender,
        date_of_birth: onboardingData.birthday,
        height: onboardingData.heightCm,
        weight: onboardingData.weightKg,
        fitness_goal: onboardingData.goal,
        activity_level: onboardingData.activityLevel,
        target_weight: onboardingData.targetWeight,
        dietary_preferences: onboardingData.dietaryPreferences,
        medical_conditions: onboardingData.medicalConditions,
        allergies: onboardingData.allergies,

        // From auth service
        email: userData?.email,
        profile_picture: userData?.profile_picture,

        // Local state
        onboarding_completed: await authService.hasCompletedOnboarding()
      };
    } catch (error) {
      console.error('❌ Failed to get frontend data:', error);
      return {};
    }
  }

  // Get data stored in backend
  private async getBackendData(): Promise<any> {
    try {
      const profile = await apiService.getComprehensiveProfile();
      const healthMetrics = await apiService.getHealthMetrics();

      return {
        // From comprehensive profile
        id: profile.id,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        height: profile.height,
        weight: profile.weight,
        fitness_goal: profile.fitness_goal,
        activity_level: profile.activity_level,
        target_weight: profile.target_weight,
        dietary_preferences: profile.dietary_preferences,
        medical_conditions: profile.medical_conditions,
        allergies: profile.allergies,
        profile_picture: profile.profile_picture,
        bio: profile.bio,
        location: profile.location,

        // System fields
        onboarding_completed: profile.onboarding_completed,
        onboarding_completed_at: profile.onboarding_completed_at,
        last_active_at: profile.last_active_at,
        created_at: profile.created_at,
        updated_at: profile.updated_at,

        // Health metrics
        bmi: healthMetrics?.metrics?.bmi,
        daily_calories: healthMetrics?.metrics?.daily_calories
      };
    } catch (error) {
      console.error('❌ Failed to get backend data:', error);
      return {};
    }
  }

  // Fix data inconsistencies
  async fixDataIssues(issues: Array<any>): Promise<{ success: boolean; fixed: string[] }> {
    const fixed = [];

    try {
      console.log('🔧 Attempting to fix data issues...');

      for (const issue of issues) {
        try {
          switch (issue.field) {
            case 'onboarding_status':
              if (issue.frontendValue && !issue.backendValue) {
                // Mark onboarding as complete in backend
                await apiService.submitOnboardingData({});
                fixed.push('onboarding_status');
              }
              break;

            case 'height':
            case 'weight':
            case 'fitness_goal':
            case 'activity_level':
              if (issue.frontendValue && !issue.backendValue) {
                // Update missing field in backend
                const updateData = { [issue.field]: issue.frontendValue };
                await apiService.updateComprehensiveProfile(updateData);
                fixed.push(issue.field);
              }
              break;

            default:
              console.warn(`⚠️ No automatic fix available for field: ${issue.field}`);
          }
        } catch (error) {
          console.error(`❌ Failed to fix ${issue.field}:`, error);
        }
      }

      const success = fixed.length > 0;
      console.log(`✅ Fixed ${fixed.length} data issues: ${fixed.join(', ')}`);

      return { success, fixed };

    } catch (error) {
      console.error('❌ Data fix process failed:', error);
      return { success: false, fixed: [] };
    }
  }

  // Generate data consistency report
  async generateConsistencyReport(): Promise<{
    timestamp: string;
    summary: {
      total_fields: number;
      matching_fields: number;
      mismatching_fields: number;
      missing_fields: number;
    };
    details: any;
  }> {
    const validation = await this.validateAllData();

    const totalFields = 15; // Number of critical fields we check
    const matchingFields = totalFields - validation.issues.length;
    const missingFields = validation.issues.filter(i => i.backendValue === null).length;
    const mismatchingFields = validation.issues.filter(i => i.backendValue !== null).length;

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total_fields: totalFields,
        matching_fields: matchingFields,
        mismatching_fields: mismatchingFields,
        missing_fields: missingFields
      },
      details: validation.issues
    };
  }
}

export const dataValidationService = DataValidationService.getInstance();
