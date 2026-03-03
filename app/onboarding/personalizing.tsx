import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONBOARDING_COMPLETED_KEY = 'nutrio_onboarding_completed';

export default function PersonalizingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const steps = [
    'Analyzing your profile...',
    'Setting your nutrition goals...',
    'Building your meal schedule...',
    'Personalizing recommendations...',
  ];

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    const next = () => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          clearInterval(t);
          setDone(true);
          return s;
        }
        return s + 1;
      });
    };
    t = setInterval(next, 800);
    return () => clearInterval(t);
  }, [steps.length]);

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    router.replace('/Zoefit/welcomePage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Personalizing your Nutrio experience</Text>
        <Text style={styles.subtitle}>
          We're setting everything up based on your goals and schedule.
        </Text>

        {!done ? (
          <>
            <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
            <Text style={styles.stepText}>{steps[step]}</Text>
            <View style={styles.progressWrap}>
              <View style={[styles.progressBar, { width: `${((step + 1) / steps.length) * 100}%` }]} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.doneEmoji}>✨</Text>
            <Text style={styles.doneTitle}>{"You're all set!"}</Text>
            <Text style={styles.doneSubtitle}>
              Your Nutrio experience is ready. {"We've"} customized meal suggestions, reminders, and
              goals based on your profile.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleFinish}>
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </>
        )}
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
    padding: 28,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  stepText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 16,
  },
  progressWrap: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  doneEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
