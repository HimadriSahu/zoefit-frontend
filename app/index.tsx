import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isOnboardingComplete, shouldShowWeeklyProgress } = useOnboarding();

  if (isLoading) {
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
    // Check if user has completed onboarding
    if (!isOnboardingComplete) {
      return <Redirect href="/onboarding" />;
    }

    // Check if weekly progress is needed (only if it's been more than 7 days)
    if (shouldShowWeeklyProgress()) {
      return <Redirect href="/screens/progress-entry" />;
    }

    // If onboarding is complete and no progress needed, redirect to home page
    return <Redirect href="/Zoefit/home" />;
  }

  return <Redirect href="/LoginScreen" />;
}