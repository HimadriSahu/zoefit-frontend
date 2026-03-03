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

const { width: screenWidth } = Dimensions.get('window');

const LoginScreen = () => {
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
      
      Alert.alert(
        '🎉 Welcome to ZoeFit!',
        'Login successful! Ready to crush your fitness goals?',
        [
          {
            text: 'Let\'s Go!',
            onPress: () => {
              // Onboarding pages run before home
              router.replace('/onboarding' as import('expo-router').Href);
            },
          },
        ]
      );
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
    <View style={{ flex: 1, backgroundColor: '#0a0f1c' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient 
          colors={['#667eea', '#764ba2', '#f093fb']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.logo}>Zoefit</Text>
            <Text style={styles.tagline}>Transform Your Health Journey</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.container}>
          <View style={styles.cardGlass}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Ready to crush your fitness goals?</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient 
                colors={loading ? ['#4a5568', '#2d3748'] : ['#667eea', '#764ba2']} 
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

            <Text style={styles.footerText}>
              {"Don't have an account? "}
              <Text 
                style={styles.linkText} 
                onPress={() => router.push('/SignupScreen')}
              >
                Start Your Journey
              </Text>
            </Text>
            
            <View style={styles.motivationCard}>
              <Text style={styles.motivationalText}>
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
    paddingTop: 20,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
    textAlign: 'center',
  },
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    padding: 30,
    marginTop: -30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footerText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
  },
  linkText: {
    color: '#a78bfa',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  motivationCard: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  motivationalText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
