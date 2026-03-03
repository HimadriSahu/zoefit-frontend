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

const SignupScreen = () => {
  // Normalize different error shapes coming from ApiService
  const getPayloadFromError = (err: any) => {
    if (!err) return {};
    if (err.body) return err.body;
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
    if (typeof err === 'object') return err;
    return { detail: String(err) };
  };
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    // Basic validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields to create your account.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords don\'t match. Please double-check and try again.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password Too Short', 'Your password must be at least 8 characters long for security.');
      return;
    }

    setLoading(true);
    
    try {
      const _response = await authService.register(username.trim(), email.trim(), password);
      
      Alert.alert(
        '🎉 Account Created!',
        'Welcome to ZoeFit! Your fitness journey starts now. Complete a few quick questions to personalize Nutrio, then you\'re ready to go!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Onboarding pages run before home
              router.replace('/onboarding' as import('expo-router').Href);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Signup error:', error);

      let payload = getPayloadFromError(error);
      let errorMessage = 'Registration failed. Please try again.';

      // Handle specific error scenarios using structured body first
      if (payload?.email) {
        const msg = Array.isArray(payload.email) ? payload.email[0] : String(payload.email);
        if (msg.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Try logging in instead!';
        } else {
          errorMessage = msg;
        }
      } else if (payload?.username) {
        const msg = Array.isArray(payload.username) ? payload.username[0] : String(payload.username);
        if (msg.includes('already exists')) {
          errorMessage = 'This username is already taken. Please choose another one.';
        } else {
          errorMessage = msg;
        }
      } else if (payload?.password) {
        errorMessage = Array.isArray(payload.password) ? payload.password[0] : String(payload.password);
      } else if (payload?.non_field_errors) {
        errorMessage = Array.isArray(payload.non_field_errors) ? payload.non_field_errors[0] : String(payload.non_field_errors);
      } else if (payload?.detail) {
        errorMessage = String(payload.detail);
      } else if (payload?.error) {
        errorMessage = String(payload.error);
      }
      
      Alert.alert(
        'Registration Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => router.push('/LoginScreen'),
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
        <Text style={styles.subtitle}>Begin Your Fitness Transformation</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text 
            style={styles.linkText} 
            onPress={() => router.push('/LoginScreen')}
          >
            Continue Your Journey
          </Text>
        </Text>
        
        <Text style={styles.motivationalText}>
          🏃‍♂️ Your future self will thank you!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1565C0',
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
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1565C0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#90caf9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#1565C0',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  motivationalText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#1565C0',
    fontSize: 12,
    fontStyle: 'italic',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#777',
    fontSize: 13,
  },
});