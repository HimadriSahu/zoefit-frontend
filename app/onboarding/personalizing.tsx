import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/auth';
import { apiService } from '../../services/api';
import { useOnboarding } from '../screens/OnboardingContext';

export default function PersonalizingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const { data: onboardingData } = useOnboarding();

  const steps = [
    'Analyzing your profile...',
    'Setting your nutrition goals...',
    'Building your meal schedule...',
    'Personalizing recommendations...',
  ];

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    const next = () => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          clearInterval(t);
          setDone(true);
          return s;
        }
        return s + 1;
      });
    };
    t = setInterval(next, 800);
    return () => clearInterval(t);
  }, [steps.length]);

  const handleFinish = async () => {
    try {
      // Step 1: Submit comprehensive onboarding data to backend
      const comprehensiveOnboardingData = {
        // Basic demographics
        gender: onboardingData.gender,
        date_of_birth: onboardingData.birthday,
        height: onboardingData.heightCm,
        weight: onboardingData.weightKg,

        // Goals and preferences
        fitness_goal: onboardingData.goal,
        target_weight: onboardingData.targetWeight,
        activity_level: onboardingData.activityLevel,

        // Schedule
        breakfast_time: onboardingData.breakfastTime,
        dinner_time: onboardingData.dinnerTime,

        // Contact and profile
        phone_number: onboardingData.phoneNumber,
        bio: onboardingData.bio,
        location: onboardingData.location,

        // Health and dietary
        dietary_preferences: onboardingData.dietaryPreferences,
        medical_conditions: onboardingData.medicalConditions,
        allergies: onboardingData.allergies,

        // Workout preferences
        difficulty_level: onboardingData.difficultyLevel,
        workout_type_preference: onboardingData.workoutTypePreference,

        // Progress tracking
        body_fat_percentage: onboardingData.bodyFatPercentage,
        muscle_mass: onboardingData.muscleMass,
      };

      await apiService.submitOnboardingData(comprehensiveOnboardingData);

      // Step 2: Create health metrics with real user data
      const healthMetricsData = {
        height: onboardingData.heightCm || 170,
        weight: onboardingData.weightKg || 70,
        fitness_goal: (onboardingData.goal as 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'strength') || 'maintenance',
        activity_level: onboardingData.activityLevel || 'moderate',
        target_weight: onboardingData.targetWeight || onboardingData.weightKg || 70,
      };

      await apiService.createOrUpdateHealthMetrics(healthMetricsData);

      // Step 3: Update comprehensive profile with additional data
      const profileUpdateData = {
        first_name: '', // Will be filled from user registration
        last_name: '',
        phone_number: onboardingData.phoneNumber,
        bio: onboardingData.bio,
        location: onboardingData.location,
        fitness_goal: onboardingData.goal,
        height: onboardingData.heightCm,
        weight: onboardingData.weightKg,
      };

      await apiService.updateComprehensiveProfile(profileUpdateData);

    } catch (error) {
      console.error('❌ Onboarding submission failed:', error);
      Alert.alert(
        'Setup Incomplete',
        'There was an error setting up your profile. Please try again.',
        [{ text: 'Retry', onPress: () => router.replace('/onboarding/personalizing') }]
      );
    }

    // Mark onboarding as completed locally
    await authService.setOnboardingCompleted(true);

    // Show success confirmation
    Alert.alert(
      'Setup Complete!',
      'Your profile has been successfully set up. Welcome to ZoeFit!',
      [{ text: 'Get Started', onPress: () => router.replace('/screens/welcomePage') }]
    );

    router.replace('/screens/welcomePage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Personalizing your Nutrio experience</Text>
        <Text style={styles.subtitle}>
          We're setting everything up based on your goals and schedule.
        </Text>

        {!done ? (
          <>
            <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
            <Text style={styles.stepText}>{steps[step]}</Text>
            <View style={styles.progressWrap}>
              <View style={[styles.progressBar, { width: `${((step + 1) / steps.length) * 100}%` }]} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.doneEmoji}>✨</Text>
            <Text style={styles.doneTitle}>You're All Set!</Text>
            <Text style={styles.doneSubtitle}>
              Your Nutrio experience is ready. {"We've"} customized meal suggestions, reminders, and
              goals based on your profile.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleFinish}>
              <Text style={styles.buttonText}>Go to Welcome</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 28,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  stepText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 16,
  },
  progressWrap: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  doneEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
