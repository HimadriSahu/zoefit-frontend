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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/auth';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ZOEFIT</Text>
        <Text style={styles.subtitle}>Transform Your Health Journey</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
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
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
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
        
        <Text style={styles.motivationalText}>
          &#x1F4AA; Every workout counts!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 25,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#777',
    fontSize: 13,
  },
  linkText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#2E7D32',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  motivationalText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#2E7D32',
    fontSize: 12,
    fontStyle: 'italic',
  },
});