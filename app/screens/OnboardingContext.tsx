import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Gender = 'male' | 'female' | 'other' | null;
export type NutrioGoal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'eat_healthier' | null;

export interface OnboardingData {
  gender: Gender;
  birthday: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: NutrioGoal | null;
  breakfastTime: string | null;
  dinnerTime: string | null;
  // User Profile fields
  phoneNumber: string | null;
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  // Health Metrics fields
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  dietaryPreferences: Record<string, any> | null;
  medicalConditions: string[] | null;
  allergies: string[] | null;
  targetWeight: number | null;
  // Workout Plan fields
  equipmentNeeded: string[] | null;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  workoutTypePreference: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed' | null;
  // Progress Tracking fields
  bodyFatPercentage: number | null;
  muscleMass: number | null;
}

const defaultData: OnboardingData = {
  gender: null,
  birthday: null,
  heightCm: null,
  weightKg: null,
  goal: null,
  breakfastTime: null,
  dinnerTime: null,
  // User Profile fields
  phoneNumber: null,
  profilePicture: null,
  bio: null,
  location: null,
  // Health Metrics fields
  activityLevel: null,
  dietaryPreferences: null,
  medicalConditions: null,
  allergies: null,
  targetWeight: null,
  // Workout Plan fields
  equipmentNeeded: null,
  difficultyLevel: null,
  workoutTypePreference: null,
  // Progress Tracking fields
  bodyFatPercentage: null,
  muscleMass: null,
};

interface OnboardingContextType {
  data: OnboardingData;
  setGender: (g: Gender) => void;
  setBirthday: (d: string) => void;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
  setGoal: (g: NutrioGoal) => void;
  setBreakfastTime: (t: string) => void;
  setDinnerTime: (t: string) => void;
  // User Profile setters
  setPhoneNumber: (p: string) => void;
  setProfilePicture: (p: string) => void;
  setBio: (b: string) => void;
  setLocation: (l: string) => void;
  // Health Metrics setters
  setActivityLevel: (a: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') => void;
  setDietaryPreferences: (d: Record<string, any>) => void;
  setMedicalConditions: (m: string[]) => void;
  setAllergies: (a: string[]) => void;
  setTargetWeight: (t: number) => void;
  // Workout Plan setters
  setEquipmentNeeded: (e: string[]) => void;
  setDifficultyLevel: (d: 'beginner' | 'intermediate' | 'advanced') => void;
  setWorkoutTypePreference: (w: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed') => void;
  // Progress Tracking setters
  setBodyFatPercentage: (b: number) => void;
  setMuscleMass: (m: number) => void;
  reset: () => Promise<void>;
  isOnboardingComplete: () => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('onboardingData');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            setData(parsedData);
          } catch (parseError) {
            console.error('Error parsing onboarding data:', parseError);
            // If parsing fails, clear the bad data
            await AsyncStorage.removeItem('onboardingData');
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem('onboardingData', JSON.stringify(data));
        } catch (error) {
          console.error('Error saving onboarding data:', error);
        }
      };
      saveData();
    }
  }, [data, isLoading]);

  const setGender = (gender: Gender) => setData((p) => ({ ...p, gender }));
  const setBirthday = (birthday: string) => setData((p) => ({ ...p, birthday }));
  const setHeightCm = (heightCm: number) => setData((p) => ({ ...p, heightCm }));
  const setWeightKg = (weightKg: number) => setData((p) => ({ ...p, weightKg }));
  const setGoal = (goal: NutrioGoal) => setData((p) => ({ ...p, goal }));
  const setBreakfastTime = (breakfastTime: string) => setData((p) => ({ ...p, breakfastTime }));
  const setDinnerTime = (dinnerTime: string) => setData((p) => ({ ...p, dinnerTime }));
  // User Profile setters
  const setPhoneNumber = (phoneNumber: string) => setData((p) => ({ ...p, phoneNumber }));
  const setProfilePicture = (profilePicture: string) => setData((p) => ({ ...p, profilePicture }));
  const setBio = (bio: string) => setData((p) => ({ ...p, bio }));
  const setLocation = (location: string) => setData((p) => ({ ...p, location }));
  // Health Metrics setters
  const setActivityLevel = (activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') => setData((p) => ({ ...p, activityLevel }));
  const setDietaryPreferences = (dietaryPreferences: Record<string, any>) => setData((p) => ({ ...p, dietaryPreferences }));
  const setMedicalConditions = (medicalConditions: string[]) => setData((p) => ({ ...p, medicalConditions }));
  const setAllergies = (allergies: string[]) => setData((p) => ({ ...p, allergies }));
  const setTargetWeight = (targetWeight: number) => setData((p) => ({ ...p, targetWeight }));
  // Workout Plan setters
  const setEquipmentNeeded = (equipmentNeeded: string[]) => setData((p) => ({ ...p, equipmentNeeded }));
  const setDifficultyLevel = (difficultyLevel: 'beginner' | 'intermediate' | 'advanced') => setData((p) => ({ ...p, difficultyLevel }));
  const setWorkoutTypePreference = (workoutTypePreference: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed') => setData((p) => ({ ...p, workoutTypePreference }));
  // Progress Tracking setters
  const setBodyFatPercentage = (bodyFatPercentage: number) => setData((p) => ({ ...p, bodyFatPercentage }));
  const setMuscleMass = (muscleMass: number) => setData((p) => ({ ...p, muscleMass }));
  const reset = async () => {
    setData(defaultData);
    try {
      await AsyncStorage.removeItem('onboardingData');
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  const isOnboardingComplete = (): boolean => {
    return !!(
      data.gender &&
      data.birthday &&
      data.heightCm &&
      data.weightKg &&
      data.goal &&
      data.breakfastTime &&
      data.dinnerTime
    );
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setGender,
        setBirthday,
        setHeightCm,
        setWeightKg,
        setGoal,
        setBreakfastTime,
        setDinnerTime,
        // User Profile setters
        setPhoneNumber,
        setProfilePicture,
        setBio,
        setLocation,
        // Health Metrics setters
        setActivityLevel,
        setDietaryPreferences,
        setMedicalConditions,
        setAllergies,
        setTargetWeight,
        // Workout Plan setters
        setEquipmentNeeded,
        setDifficultyLevel,
        setWorkoutTypePreference,
        // Progress Tracking setters
        setBodyFatPercentage,
        setMuscleMass,
        reset,
        isOnboardingComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

// Default export to prevent expo-router from treating this as a route
export default function OnboardingContextComponent() {
  return null;
}
