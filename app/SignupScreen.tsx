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

const SignupScreen = () => {
  const { theme } = useTheme();
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
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>Begin Your Fitness Transformation</Text>
          </View>
        </LinearGradient>

        <View style={styles.container}>
          <View style={[styles.cardGlass, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Join ZoeFit</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Start your journey to a healthier you</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.settingRowBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Username"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
            />

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

            <TextInput
              style={[styles.input, { backgroundColor: theme.settingRowBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.textSecondary}
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
                colors={loading ? ['#4a5568', '#2d3748'] : [theme.primary, theme.primaryDark]}
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

            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
              <Text
                style={[styles.linkText, { color: theme.primary }]}
                onPress={() => router.push('/LoginScreen')}
              >
                Continue Your Journey
              </Text>
            </Text>

            <View style={[styles.motivationCard, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
              <Text style={[styles.motivationalText, { color: theme.primary }]}>
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
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
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
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardGlass: {
    borderRadius: 24,
    padding: 20,
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
    marginBottom: 6,
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
    marginBottom: 14,
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
  motivationCard: {
    borderRadius: 12,
    padding: 12,
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
