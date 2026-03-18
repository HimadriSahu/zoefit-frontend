import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const MedicalConditionsScreen = () => {
  const router = useRouter();
  const { data, setMedicalConditions } = useOnboarding();
  const { theme } = useTheme();
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [hasConditions, setHasConditions] = useState<boolean | null>(null);

  const commonConditions = [
    { id: 'diabetes', name: 'Diabetes', icon: '🩺', description: 'Type 1 or Type 2' },
    { id: 'heart_disease', name: 'Heart Disease', icon: '❤️', description: 'Cardiovascular conditions' },
    { id: 'hypertension', name: 'High Blood Pressure', icon: '📈', description: 'Hypertension' },
    { id: 'asthma', name: 'Asthma', icon: '🫁', description: 'Respiratory condition' },
    // { id: 'arthritis', name: 'Arthritis', icon: '🦴', description: 'Joint inflammation' },
    { id: 'back_pain', name: 'Back Pain', icon: '🦯', description: 'Chronic back issues' },
    { id: 'obesity', name: 'Obesity', icon: '⚖️', description: 'BMI 30+' },
    // { id: 'osteoporosis', name: 'Osteoporosis', icon: '🦴', description: 'Bone density loss' },
    { id: 'migraines', name: 'Migraines', icon: '🤕', description: 'Severe headaches' },
    { id: 'depression', name: 'Depression', icon: '🧠', description: 'Mental health condition' },
    { id: 'anxiety', name: 'Anxiety', icon: '😰', description: 'Anxiety disorders' },
    { id: 'sleep_apnea', name: 'Sleep Apnea', icon: '😴', description: 'Breathing during sleep' },
  ];

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => {
      if (prev.includes(conditionId)) {
        return prev.filter(id => id !== conditionId);
      } else {
        return [...prev, conditionId];
      }
    });
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions(prev => [...prev, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const handleContinue = () => {
    // Store medical conditions in onboarding context
    const conditionsToStore = hasConditions ? selectedConditions : [];
    setMedicalConditions(conditionsToStore);

    console.log('Has conditions:', hasConditions);
    console.log('Selected conditions:', selectedConditions);

    // Navigate to final onboarding step
    router.push('/onboarding/workout-preferences');
  };

  const handleSkip = () => {
    router.push('/onboarding/workout-preferences');
  };

  if (hasConditions === null) {
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
            <Text style={styles.headerTitle}>Medical Conditions</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '88%', backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 8 of 9</Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>
              Do you have any medical conditions?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              This helps us ensure your workout and nutrition plans are safe and appropriate
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => setHasConditions(true)}
              >
                <Text style={styles.optionIcon}>✅</Text>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Yes, I have conditions</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  I'll tell you about my medical conditions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => setHasConditions(false)}
              >
                <Text style={styles.optionIcon}>❌</Text>
                <Text style={[styles.optionTitle, { color: theme.text }]}>No, I'm healthy</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  I don't have any medical conditions
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimerContainer}>
              <Text style={[styles.disclaimerTitle, { color: theme.text }]}>Important Note</Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                Always consult with your healthcare provider before starting any new fitness or nutrition program.
                This information helps us provide safer recommendations, but should not replace medical advice.
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
          <Text style={styles.headerTitle}>Medical Conditions</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '88%', backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 8 of 9</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            What medical conditions do you have?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select all that apply to you
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.conditionsGrid}>
              {commonConditions.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.conditionCard,
                    {
                      backgroundColor: selectedConditions.includes(condition.id)
                        ? '#fbbf24'
                        : theme.cardBackground,
                      borderColor: theme.border,
                    }
                  ]}
                  onPress={() => toggleCondition(condition.id)}
                >
                  <Text style={styles.conditionIcon}>{condition.icon}</Text>
                  <Text style={[
                    styles.conditionName,
                    { color: selectedConditions.includes(condition.id) ? '#fff' : theme.text }
                  ]}>
                    {condition.name}
                  </Text>
                  <Text style={[
                    styles.conditionDescription,
                    { color: selectedConditions.includes(condition.id) ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                  ]}>
                    {condition.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Condition Input */}
            <View style={[styles.customConditionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.customConditionLabel, { color: theme.text }]}>Add Custom Condition:</Text>
              <View style={styles.customConditionInputContainer}>
                <TextInput
                  style={[styles.customConditionInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  value={customCondition}
                  onChangeText={setCustomCondition}
                  placeholder="Enter condition name"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.primary }]}
                  onPress={addCustomCondition}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Custom Conditions List */}
              {selectedConditions.filter(c => !commonConditions.find(opt => opt.id === c)).map((condition, index) => (
                <View key={index} style={styles.customConditionItem}>
                  <Text style={[styles.customConditionText, { color: theme.text }]}>{condition}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => setSelectedConditions(prev => prev.filter(c => c !== condition))}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.disclaimerContainer}>
              <Text style={[styles.disclaimerTitle, { color: theme.text }]}>Privacy & Safety</Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                Your medical information is kept private and secure. We use this information only to provide safer workout and nutrition recommendations. Always follow your doctor's advice.
              </Text>
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
  disclaimerContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
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
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  conditionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  conditionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  customConditionContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  customConditionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customConditionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customConditionInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customConditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  customConditionText: {
    fontSize: 14,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default MedicalConditionsScreen;
