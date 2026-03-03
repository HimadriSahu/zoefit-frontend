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
            <Text style={styles.tagline}>Begin Your Fitness Transformation</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.container}>
          <View style={styles.cardGlass}>
            <Text style={styles.title}>Join ZoeFit</Text>
            <Text style={styles.subtitle}>Start your journey to a healthier you</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={username}
              onChangeText={setUsername}
            />

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

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSignup}
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
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
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
            
            <View style={styles.motivationCard}>
              <Text style={styles.motivationalText}>
                🏃‍♂️ Your future self will thank you!
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SignupScreen;

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
    marginBottom: 14,
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
