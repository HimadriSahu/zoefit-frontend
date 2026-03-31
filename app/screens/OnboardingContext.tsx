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
  // Health Metrics fields
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  dietaryPreferences: Record<string, any> | null;
  medicalConditions: string[] | null;
  allergies: string[] | null;
  targetWeight: number | null;
  equipmentAvailable: string[] | null;
}

const defaultData: OnboardingData = {
  gender: null,
  birthday: null,
  heightCm: null,
  weightKg: null,
  goal: null,
  // Health Metrics fields
  activityLevel: null,
  dietaryPreferences: null,
  medicalConditions: null,
  allergies: null,
  targetWeight: null,
  equipmentAvailable: null,
};

interface OnboardingContextType {
  data: OnboardingData;
  setGender: (g: Gender) => void;
  setBirthday: (d: string) => void;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
  setGoal: (g: NutrioGoal) => void;
  // Health Metrics setters
  setActivityLevel: (a: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') => void;
  setDietaryPreferences: (d: Record<string, any>) => void;
  setMedicalConditions: (m: string[]) => void;
  setAllergies: (a: string[]) => void;
  setTargetWeight: (t: number) => void;
  setEquipmentAvailable: (e: string[]) => void;
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
  // Health Metrics setters
  const setActivityLevel = (activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') => setData((p) => ({ ...p, activityLevel }));
  const setDietaryPreferences = (dietaryPreferences: Record<string, any>) => setData((p) => ({ ...p, dietaryPreferences }));
  const setMedicalConditions = (medicalConditions: string[]) => setData((p) => ({ ...p, medicalConditions }));
  const setAllergies = (allergies: string[]) => setData((p) => ({ ...p, allergies }));
  const setTargetWeight = (targetWeight: number) => setData((p) => ({ ...p, targetWeight }));
  const setEquipmentAvailable = (equipmentAvailable: string[]) => setData((p) => ({ ...p, equipmentAvailable }));
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
      data.goal
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
        // Health Metrics setters
        setActivityLevel,
        setDietaryPreferences,
        setMedicalConditions,
        setAllergies,
        setTargetWeight,
        setEquipmentAvailable,
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
