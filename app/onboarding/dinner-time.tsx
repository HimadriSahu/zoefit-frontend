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

const TIME_OPTIONS = [
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM',
];

export default function DinnerTimeScreen() {
  const router = useRouter();
  const { data, setDinnerTime } = useOnboarding();
  const [customTime, setCustomTime] = useState('');

  const handleSelect = (time: string) => {
    setDinnerTime(time);
    setCustomTime('');
  };

  const handleContinue = () => {
    if (customTime.trim()) setDinnerTime(customTime.trim());
    if (data.dinnerTime || customTime.trim()) router.replace('/onboarding/personalizing');
  };

  const valid = !!data.dinnerTime || !!customTime.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>When do you usually have dinner?</Text>
        <Text style={styles.subtitle}>{"We'll align your dinner suggestions with your schedule."}</Text>

        <View style={styles.options}>
          {TIME_OPTIONS.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.option, data.dinnerTime === time && styles.optionSelected]}
              onPress={() => handleSelect(time)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, data.dinnerTime === time && styles.optionTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.orLabel}>Or enter a custom time</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 7:45 PM"
          placeholderTextColor="#999"
          value={customTime}
          onChangeText={(t) => setCustomTime(t)}
        />

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
    maxHeight: '90%',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#2E7D32',
  },
  orLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
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
