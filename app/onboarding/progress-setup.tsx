import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const ProgressSetupScreen = () => {
  const router = useRouter();
  const { data, setBodyFatPercentage, setMuscleMass } = useOnboarding();
  const { theme } = useTheme();
  const [bodyFat, setBodyFat] = useState<string>(data.bodyFatPercentage?.toString() || '');
  const [muscleMass, setMuscleMassValue] = useState<string>(data.muscleMass?.toString() || '');
  const [hasAdvancedMetrics, setHasAdvancedMetrics] = useState<boolean | null>(
    data.bodyFatPercentage !== null || data.muscleMass !== null ? true : null
  );

  const validateBodyFat = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 3 && num <= 60; // Valid range for body fat percentage
  };

  const validateMuscleMass = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 20 && num <= 200; // Reasonable range for muscle mass in kg
  };

  const handleContinue = () => {
    if (hasAdvancedMetrics === true) {
      // Validate inputs if user wants to track advanced metrics
      if (bodyFat && !validateBodyFat(bodyFat)) {
        Alert.alert('Invalid Input', 'Please enter a valid body fat percentage (3-60%).');
        return;
      }
      if (muscleMass && !validateMuscleMass(muscleMass)) {
        Alert.alert('Invalid Input', 'Please enter a valid muscle mass (20-200 kg).');
        return;
      }

      // Save values if provided
      if (bodyFat) {
        setBodyFatPercentage(parseFloat(bodyFat));
      }
      if (muscleMass) {
        setMuscleMass(parseFloat(muscleMass));
      }
    }

    console.log('Has advanced metrics:', hasAdvancedMetrics);
    console.log('Body fat %:', bodyFat);
    console.log('Muscle mass (kg):', muscleMass);

    // Navigate to contact information
    router.push('/onboarding/contact-info' as any);
  };

  const handleSkip = () => {
    router.push('/onboarding/contact-info' as any);
  };

  if (hasAdvancedMetrics === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient
            colors={theme.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Progress Tracking</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%', backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 9 of 9</Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>
              Track advanced body metrics?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              This helps us provide more accurate progress tracking and recommendations
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => setHasAdvancedMetrics(true)}
              >
                <Text style={styles.optionIcon}>📊</Text>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Yes, track advanced metrics</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  I'll provide body fat percentage and muscle mass
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => setHasAdvancedMetrics(false)}
              >
                <Text style={styles.optionIcon}>⚖️</Text>
                <Text style={[styles.optionTitle, { color: theme.text }]}>No, basic tracking only</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  I'll just track weight and basic measurements
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>Why track advanced metrics?</Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • Body fat percentage shows your true body composition{'\n'}
                • Muscle mass tracking helps ensure you're losing fat, not muscle{'\n'}
                • More accurate progress tracking and recommendations{'\n'}
                • Better understanding of your fitness journey
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advanced Metrics</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%', backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 9 of 9</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>
              Enter your advanced metrics
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              These measurements help us create more accurate progress tracking
            </Text>

            <View style={styles.metricsContainer}>
              {/* Body Fat Percentage */}
              <View style={[styles.metricCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>📊</Text>
                  <View style={styles.metricInfo}>
                    <Text style={[styles.metricTitle, { color: theme.text }]}>Body Fat Percentage</Text>
                    <Text style={[styles.metricDescription, { color: theme.textSecondary }]}>
                      Percentage of your body weight that is fat
                    </Text>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.metricInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    placeholder="e.g. 18.5"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>%</Text>
                </View>

                <View style={styles.referenceContainer}>
                  <Text style={[styles.referenceTitle, { color: theme.textSecondary }]}>Typical ranges:</Text>
                  <Text style={[styles.referenceText, { color: theme.textSecondary }]}>
                    Women: 21-32% | Men: 14-25%
                  </Text>
                </View>
              </View>

              {/* Muscle Mass */}
              <View style={[styles.metricCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricIcon}>💪</Text>
                  <View style={styles.metricInfo}>
                    <Text style={[styles.metricTitle, { color: theme.text }]}>Muscle Mass</Text>
                    <Text style={[styles.metricDescription, { color: theme.textSecondary }]}>
                      Total weight of muscle tissue in your body
                    </Text>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.metricInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                    value={muscleMass}
                    onChangeText={setMuscleMassValue}
                    placeholder="e.g. 45.5"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                    maxLength={6}
                  />
                  <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>kg</Text>
                </View>

                <View style={styles.referenceContainer}>
                  <Text style={[styles.referenceTitle, { color: theme.textSecondary }]}>Typical ranges:</Text>
                  <Text style={[styles.referenceText, { color: theme.textSecondary }]}>
                    Women: 30-35kg | Men: 40-50kg
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.disclaimerContainer}>
              <Text style={[styles.disclaimerTitle, { color: theme.text }]}>How to measure</Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                These metrics are typically measured using: {'\n'}
                • DEXA scan (most accurate) {'\n'}
                • Bioelectrical impedance scales {'\n'}
                • Caliper measurements {'\n'}
                {'\n'}
                Don't worry if you don't have these measurements now - you can add them later!
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: theme.border }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.primary }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#047857',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#f0f8f9',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#1399a3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1399a3',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  metricsContainer: {
    marginBottom: 32,
  },
  metricCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metricIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricInput: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
  },
  referenceContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  referenceTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 12,
    lineHeight: 16,
  },
  disclaimerContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    width: '30%',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    width: '65%',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressSetupScreen;
