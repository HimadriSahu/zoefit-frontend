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

export default function HeightScreen() {
  const router = useRouter();
  const { data, setHeightCm } = useOnboarding();
  const [value, setValue] = useState(data.heightCm?.toString() ?? '');

  const handleContinue = () => {
    const cm = parseInt(value, 10);
    if (!isNaN(cm) && cm >= 100 && cm <= 250) {
      setHeightCm(cm);
      router.push('/onboarding/weight');
    }
  };

  const cm = parseInt(value, 10);
  const valid = !isNaN(cm) && cm >= 100 && cm <= 250;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>How tall are you?</Text>
        <Text style={styles.subtitle}>Enter your height in centimeters.</Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 170"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={value}
            onChangeText={setValue}
            maxLength={3}
          />
          <Text style={styles.unit}>cm</Text>
        </View>
        {value.length > 0 && !valid && (
          <Text style={styles.hint}>Enter a height between 100 and 250 cm</Text>
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
