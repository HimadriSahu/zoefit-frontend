import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const WorkoutPreferencesScreen = () => {
  const router = useRouter();
  const { data, setDifficultyLevel, setWorkoutTypePreference } = useOnboarding();
  const { theme } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(data.difficultyLevel);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(data.workoutTypePreference);

  const difficultyLevels = [
    {
      value: 'beginner',
      title: 'Beginner',
      description: 'New to fitness or returning after a break',
      icon: '🌱',
      examples: ['Basic movements', 'Lighter weights', 'Longer rest periods'],
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: 'Regular exercise routine, comfortable with basics',
      icon: '💪',
      examples: ['Complex movements', 'Moderate weights', 'Balanced intensity'],
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: 'Experienced with intense, challenging workouts',
      icon: '🔥',
      examples: ['Heavy weights', 'Advanced techniques', 'High intensity'],
    },
  ];

  const workoutTypes = [
    {
      value: 'strength',
      title: 'Strength Training',
      description: 'Build muscle and increase strength',
      icon: '🏋️‍♂️',
      benefits: ['Muscle growth', 'Bone density', 'Metabolism boost'],
    },
    {
      value: 'cardio',
      title: 'Cardio',
      description: 'Improve cardiovascular health and endurance',
      icon: '🏃‍♂️',
      benefits: ['Heart health', 'Stamina', 'Fat burning'],
    },
    {
      value: 'hiit',
      title: 'HIIT',
      description: 'High-intensity interval training',
      icon: '⚡',
      benefits: ['Quick workouts', 'Maximum calorie burn', 'Afterburn effect'],
    },
    {
      value: 'flexibility',
      title: 'Flexibility',
      description: 'Improve range of motion and prevent injury',
      icon: '🧘‍♀️',
      benefits: ['Injury prevention', 'Better posture', 'Stress relief'],
    },
    {
      value: 'mixed',
      title: 'Mixed Training',
      description: 'Combination of all workout types',
      icon: '🔄',
      benefits: ['Balanced fitness', 'Prevents boredom', 'Full-body development'],
    },
  ];

  const handleContinue = () => {
    // Store workout preferences in onboarding context
    if (selectedDifficulty) {
      setDifficultyLevel(selectedDifficulty as 'beginner' | 'intermediate' | 'advanced');
    }
    if (selectedWorkoutType) {
      setWorkoutTypePreference(selectedWorkoutType as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed');
    }

    console.log('Selected difficulty:', selectedDifficulty);
    console.log('Selected workout type:', selectedWorkoutType);

    // Navigate to contact information
    router.push('/onboarding/contact-info' as any);
  };

  const handleSkip = () => {
    router.push('/onboarding/contact-info' as any);
  };

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
          <Text style={styles.headerTitle}>Workout Preferences</Text>
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
              Customize your workout experience
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Tell us your preferences so we can create the perfect workout plans for you
            </Text>

            {/* Difficulty Level Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Fitness Level</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Choose your current fitness experience level
              </Text>

              {difficultyLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: selectedDifficulty === level.value
                        ? theme.primary
                        : theme.cardBackground,
                      borderColor: theme.border,
                    }
                  ]}
                  onPress={() => setSelectedDifficulty(level.value)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{level.icon}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={[
                        styles.optionTitle,
                        { color: selectedDifficulty === level.value ? '#fff' : theme.text }
                      ]}>
                        {level.title}
                      </Text>
                      <Text style={[
                        styles.optionDescription,
                        { color: selectedDifficulty === level.value ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                      ]}>
                        {level.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.examplesContainer}>
                    <Text style={[
                      styles.examplesTitle,
                      { color: selectedDifficulty === level.value ? 'rgba(255,255,255,0.9)' : theme.textSecondary }
                    ]}>
                      Examples:
                    </Text>
                    <View style={styles.examplesList}>
                      {level.examples.map((example, index) => (
                        <Text key={index} style={[
                          styles.exampleItem,
                          { color: selectedDifficulty === level.value ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                        ]}>
                          • {example}
                        </Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Workout Type Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferred Workout Type</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                What type of workouts do you enjoy most?
              </Text>

              {workoutTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: selectedWorkoutType === type.value
                        ? theme.primary
                        : theme.cardBackground,
                      borderColor: theme.border,
                    }
                  ]}
                  onPress={() => setSelectedWorkoutType(type.value)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{type.icon}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={[
                        styles.optionTitle,
                        { color: selectedWorkoutType === type.value ? '#fff' : theme.text }
                      ]}>
                        {type.title}
                      </Text>
                      <Text style={[
                        styles.optionDescription,
                        { color: selectedWorkoutType === type.value ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                      ]}>
                        {type.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.benefitsContainer}>
                    <Text style={[
                      styles.benefitsTitle,
                      { color: selectedWorkoutType === type.value ? 'rgba(255,255,255,0.9)' : theme.textSecondary }
                    ]}>
                      Benefits:
                    </Text>
                    <View style={styles.benefitsList}>
                      {type.benefits.map((benefit, index) => (
                        <Text key={index} style={[
                          styles.benefitItem,
                          { color: selectedWorkoutType === type.value ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                        ]}>
                          ✓ {benefit}
                        </Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  examplesContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exampleItem: {
    fontSize: 12,
    marginRight: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  benefitsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitItem: {
    fontSize: 12,
    marginRight: 12,
    marginBottom: 4,
    lineHeight: 16,
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

export default WorkoutPreferencesScreen;
