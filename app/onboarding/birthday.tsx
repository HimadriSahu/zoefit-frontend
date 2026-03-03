import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../Zoefit/context/OnboardingContext';

function isValidDate(str: string): boolean {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d &&
    date.getTime() <= Date.now() &&
    y >= 1900
  );
}

export default function BirthdayScreen() {
  const router = useRouter();
  const { data, setBirthday } = useOnboarding();
  const [value, setValue] = useState(data.birthday ?? '');

  const handleContinue = () => {
    if (isValidDate(value)) {
      setBirthday(value);
      router.push('/onboarding/height');
    }
  };

  const valid = isValidDate(value);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{"When's your birthday?"}</Text>
        <Text style={styles.subtitle}>We use your age to tailor your nutrition plan. Enter as YYYY-MM-DD.</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 1995-06-15"
          placeholderTextColor="#999"
          value={value}
          onChangeText={setValue}
          maxLength={10}
        />
        {value.length > 0 && !valid && (
          <Text style={styles.hint}>Use format YYYY-MM-DD (e.g. 1990-01-15)</Text>
        )}

        <TouchableOpacity
          style={[styles.button, !valid && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!valid}
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
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#e65100',
    marginBottom: 12,
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
