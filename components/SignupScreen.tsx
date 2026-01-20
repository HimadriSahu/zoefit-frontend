import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authService } from '../services/auth';

const SignupScreen = () => {
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
      const response = await authService.register(username.trim(), email.trim(), password);
      
      Alert.alert(
        '🎉 Account Created!',
        'Welcome to ZoeFit! Your fitness journey starts now. You\'re all set up and ready to go!',
        [
          {
            text: 'Start Working Out 💪',
            onPress: () => {
              // Navigate to main app or dashboard
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle specific error scenarios
      if (error.email) {
        if (error.email[0].includes('already exists')) {
          errorMessage = 'An account with this email already exists. Try logging in instead!';
        } else {
          errorMessage = error.email[0];
        }
      } else if (error.username) {
        if (error.username[0].includes('already exists')) {
          errorMessage = 'This username is already taken. Please choose another one.';
        } else {
          errorMessage = error.username[0];
        }
      } else if (error.password) {
        errorMessage = error.password[0];
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.error) {
        errorMessage = error.error;
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