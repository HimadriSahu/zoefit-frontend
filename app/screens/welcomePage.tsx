import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/auth';

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if user is authenticated
        const isAuthenticated = await authService.isAuthenticated();

        if (isAuthenticated) {
          // User is authenticated, navigate to home
          router.replace('/Zoefit/home');
        } else {
          // User is not authenticated, navigate to login
          router.replace('/LoginScreen');
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        // On error, default to login screen
        router.replace('/LoginScreen');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndNavigate();
  }, [router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#10b981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.card}>

          {/* Title */}
          <Text style={styles.subtitle}>Welcome to</Text>
          <Text style={styles.title}>ZoeFit! 💪</Text>

          {/* Illustration */}
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
            }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Start Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/Zoefit/home')}
          >
            <Text style={styles.buttonText}>Start Your Journey</Text>
            {/* <Text style={styles.arrow}>{'→'}</Text> */}
          </TouchableOpacity>

          {/* Manual Navigation Options */}
          <View style={styles.manualNavContainer}>
            <Text style={styles.manualNavText}>Or navigate manually:</Text>
            <View style={styles.manualNavButtons}>
              <TouchableOpacity
                style={[styles.manualNavButton, styles.loginButton]}
                onPress={() => router.replace('/LoginScreen')}
              >
                <Text style={styles.manualNavButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.manualNavButton, styles.signupButton]}
                onPress={() => router.replace('/SignupScreen')}
              >
                <Text style={styles.manualNavButtonText}>Signup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },

  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginTop: 10,
    fontWeight: '500',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 20,
    textShadowColor: '#10b981',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  image: {
    width: 220,
    height: 220,
    marginVertical: 20,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonText: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontWeight: 'bold',
    borderRadius: 30,
    color: '#fff',
    fontSize: 16,
  },

  arrow: {
    color: '#fff',
    paddingHorizontal: 20,
    fontWeight: 'bold',
    fontSize: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },

  manualNavContainer: {
    marginTop: 20,
    alignItems: 'center',
  },

  manualNavText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 10,
  },

  manualNavButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  manualNavButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },

  loginButton: {
    backgroundColor: '#3b82f6',
  },

  signupButton: {
    backgroundColor: '#10b981',
  },

  manualNavButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
