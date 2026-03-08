import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../screens/OnboardingContext';

const { width: screenWidth } = Dimensions.get('window');

const OPTIONS: { value: any; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function GenderScreen() {
  const router = useRouter();
  const { data, setGender } = useOnboarding();

  const handleContinue = () => {
    if (data.gender) router.push('/onboarding/birthday');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#eafcf7' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={["#43e97b", "#38f9d7"]} style={styles.header}>
          <Text style={styles.headerTitle}>Tell us about yourself</Text>
          <Text style={styles.headerSubtitle}>Step 1 of 6</Text>
        </LinearGradient>
        
        <View style={styles.container}>
          <View style={styles.cardGlass}>
            <Text style={styles.title}>{"What's your gender?"}</Text>
            <Text style={styles.subtitle}>We use this to personalize your ZoeFit experience.</Text>

            <View style={styles.options}>
              {OPTIONS.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.option, data.gender === value && styles.optionSelected]}
                  onPress={() => setGender(value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, data.gender === value && styles.optionTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, !data.gender && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!data.gender}
            >
              <LinearGradient 
                colors={!data.gender ? ['#a5d6a7', '#81c784'] : ['#43e97b', '#2e7d32']} 
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: '#4CAF50',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 30,
    marginTop: -30,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(67,233,123,0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(67,233,123,0.2)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionSelected: {
    backgroundColor: 'rgba(67,233,123,0.1)',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 15,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#2e7d32',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    
  },
});
