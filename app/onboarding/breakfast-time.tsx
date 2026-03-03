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
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM',
];

export default function BreakfastTimeScreen() {
  const router = useRouter();
  const { data, setBreakfastTime } = useOnboarding();
  const [customTime, setCustomTime] = useState('');

  const handleContinue = () => {
    const time = customTime || data.breakfastTime;
    if (time) {
      setBreakfastTime(time);
      router.push('/onboarding/dinner-time');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>What time do you usually eat breakfast?</Text>
        
        <View style={styles.optionsContainer}>
          {TIME_OPTIONS.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.option,
                data.breakfastTime === time && styles.selectedOption,
              ]}
              onPress={() => setBreakfastTime(time)}
            >
              <Text style={[
                styles.optionText,
                data.breakfastTime === time && styles.selectedOptionText,
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.customInput}
          placeholder="Or enter custom time (e.g., 7:15 AM)"
          value={customTime}
          onChangeText={setCustomTime}
        />

        <TouchableOpacity
          style={[styles.button, (!data.breakfastTime && !customTime) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!data.breakfastTime && !customTime}
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
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 25,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
