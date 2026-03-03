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
import { useOnboarding } from '../screens/OnboardingContext';

export default function WeightScreen() {
  const router = useRouter();
  const { data, setWeightKg } = useOnboarding();
  const [value, setValue] = useState(data.weightKg?.toString() ?? '');

  const handleContinue = () => {
    const kg = parseFloat(value.replace(',', '.'));
    if (!isNaN(kg) && kg >= 30 && kg <= 300) {
      setWeightKg(kg);
      router.push('/onboarding/goal');
    }
  };

  const kg = parseFloat(value.replace(',', '.'));
  const valid = !isNaN(kg) && kg >= 30 && kg <= 300;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{"What's your current weight?"}</Text>
        <Text style={styles.subtitle}>Enter your weight in kilograms.</Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 70"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={setValue}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
        {value.length > 0 && !valid && (
          <Text style={styles.hint}>Enter a weight between 30 and 300 kg</Text>
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: '#333',
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
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
    marginTop: 8,
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
