import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/auth';
import { useTheme } from './screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const LoginScreen = () => {
  const { theme } = useTheme();
  // Normalize different error shapes coming from ApiService
  const getPayloadFromError = (err: any) => {
    if (!err) return {};
    if (err.body) return err.body;
    // If message is JSON (we sometimes stringify server body into message), try parsing it
    if (typeof err.message === 'string') {
      const text = err.message.trim();
      if ((text.startsWith('{') || text.startsWith('['))) {
        try {
          return JSON.parse(text);
        } catch (_) {
          // fallthrough
        }
      }
    }
    // If it's already an object-like structure
    if (typeof err === 'object') return err;
    return { detail: String(err) };
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword(email.trim());

      Alert.alert(
        '✅ Password Reset Sent',
        response.message + (response.note ? `\n\n${response.note}` : ''),
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);

      let errorMessage = 'Failed to send password reset email. Please try again.';

      if (error.error) {
        errorMessage = error.error;
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.error) {
        errorMessage = error.error;
      }

      Alert.alert(
        'Password Reset Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            style: 'default',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const _response = await authService.login(email.trim(), password);

      // Check if user has completed onboarding
      const hasCompletedOnboarding = await authService.hasCompletedOnboarding();

      if (hasCompletedOnboarding) {
        // User has completed onboarding, go to main app
        Alert.alert(
          '🎉 Welcome Back to ZoeFit!',
          'Login successful! Ready to continue your fitness journey?',
          [
            {
              text: 'Let\'s Go!',
              onPress: () => {
                router.replace('/screens/welcomePage' as import('expo-router').Href);
              },
            },
          ]
        );
      } else {
        // New user or user hasn't completed onboarding
        Alert.alert(
          '🎉 Welcome to ZoeFit!',
          'Login successful! Let\'s complete your profile setup to personalize your experience.',
          [
            {
              text: 'Complete Setup',
              onPress: () => {
                router.replace('/onboarding' as import('expo-router').Href);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const payload = getPayloadFromError(error);
      let errorMessage = 'Login failed. Please try again.';

      // Handle specific error scenarios from structured payload
      if (payload?.non_field_errors) {
        errorMessage = Array.isArray(payload.non_field_errors) ? payload.non_field_errors[0] : String(payload.non_field_errors);
        if (errorMessage.includes('Unable to log in')) {
          errorMessage = 'Unable to log in with provided credentials. Please check your email and password.';
        }
      } else if (payload?.detail) {
        const d = String(payload.detail);
        if (d.includes('No active account') || d.includes('Invalid credentials')) {
          errorMessage = 'Account not found. Please check your email or sign up for a new account.';
        } else if (d.includes('Email is not verified')) {
          errorMessage = 'Please verify your email address before logging in.';
        } else {
          errorMessage = d;
        }
      } else if (payload?.email) {
        errorMessage = Array.isArray(payload.email) ? payload.email[0] : String(payload.email);
      } else if (payload?.error) {
        errorMessage = String(payload.error);
      }

      Alert.alert(
        'Login Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            style: 'cancel',
          },
          {
            text: 'Sign Up',
            onPress: () => router.push('/SignupScreen'),
            style: 'default',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.logo, { color: theme.text }]}>Zoefit</Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>Transform Your Health Journey</Text>
          </View>
        </LinearGradient>

        <View style={styles.container}>
          <View style={[styles.cardGlass, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Ready to crush your fitness goals?</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.settingRowBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.settingRowBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#4a5568', '#2d3748'] : [theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {"Don't have an account? "}
              <Text
                style={[styles.linkText, { color: theme.primary }]}
                onPress={() => router.push('/SignupScreen')}
              >
                Start Your Journey
              </Text>
            </Text>

            <View style={[styles.motivationCard, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
              <Text style={[styles.motivationalText, { color: theme.primary }]}>
                💪 Every workout counts!
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardGlass: {
    borderRadius: 24,
    padding: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  linkText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  motivationCard: {
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});
