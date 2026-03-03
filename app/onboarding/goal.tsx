import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../screens/OnboardingContext';

const GOALS: { value: string; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Lose weight', emoji: '🎯' },
  { value: 'maintain', label: 'Maintain weight', emoji: '⚖️' },
  { value: 'gain_muscle', label: 'Gain muscle', emoji: '💪' },
  { value: 'eat_healthier', label: 'Eat healthier', emoji: '🥗' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { data, setGoal } = useOnboarding();

  const handleContinue = () => {
    if (data.goal) router.push('/onboarding/breakfast-time');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{"What's your main goal with Nutrio?"}</Text>
          <Text style={styles.subtitle}>{"We'll tailor your meal plans and tips to this goal."}</Text>

          <View style={styles.options}>
            {GOALS.map(({ value, label, emoji }) => (
              <TouchableOpacity
                key={value}
                style={[styles.option, data.goal === value && styles.optionSelected]}
                onPress={() => setGoal(value as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionEmoji}>{emoji}</Text>
                <Text style={[styles.optionText, data.goal === value && styles.optionTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, !data.goal && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!data.goal}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
