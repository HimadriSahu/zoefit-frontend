import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';
import { useOnboarding } from './screens/OnboardingContext';

const { width: screenWidth } = Dimensions.get('window');

const ONBOARDING_COMPLETED_KEY = 'nutrio_onboarding_completed';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic' as const,
  },
});

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const { isOnboardingComplete } = useOnboarding();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setOnboardingCompleted(completed === 'true');
      } else {
        setOnboardingCompleted(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setOnboardingCompleted(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || (isAuthenticated && onboardingCompleted === null)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f1c' }}>
        <LinearGradient 
          colors={['#667eea', '#764ba2', '#f093fb']} 
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading ZoeFit...</Text>
            <Text style={styles.loadingSubtext}>Preparing your fitness journey</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (isAuthenticated) {
    // Check if user has completed the questionnaire
    const questionnaireComplete = isOnboardingComplete();
    
    // If questionnaire is not complete, redirect to onboarding
    if (!questionnaireComplete) {
      return <Redirect href="/onboarding" />;
    }
    
    // If questionnaire is complete, redirect to welcome page
    return <Redirect href="/screens/welcomePage" />;
  }

  return <Redirect href="/LoginScreen" />;
}