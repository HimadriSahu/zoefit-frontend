import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../Zoefit/context/OnboardingContext';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{"What's your gender?"}</Text>
        <Text style={styles.subtitle}>We use this to personalize your Nutrio experience.</Text>

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
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2E7D32',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
