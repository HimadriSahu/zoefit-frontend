import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const ActivityLevelScreen = () => {
  const router = useRouter();
  const { setActivityLevel, data } = useOnboarding();
  const { theme } = useTheme();

  const activityLevels = [
    {
      value: 'sedentary',
      title: 'Sedentary',
      description: 'Little or no exercise, desk job',
      icon: '🪑',
      examples: ['Office work', 'Reading', 'Watching TV', 'Computer work'],
    },
    {
      value: 'light',
      title: 'Lightly Active',
      description: 'Light exercise 1-3 days/week',
      icon: '🚶‍♂️',
      examples: ['Walking', 'Light gardening', 'Casual sports', 'House chores'],
    },
    {
      value: 'moderate',
      title: 'Moderately Active',
      description: 'Moderate exercise 3-5 days/week',
      icon: '🏃‍♂️',
      examples: ['Regular workouts', 'Jogging', 'Cycling', 'Team sports'],
    },
    {
      value: 'active',
      title: 'Very Active',
      description: 'Hard exercise 6-7 days/week',
      icon: '💪',
      examples: ['Intense training', 'Heavy lifting', 'Competitive sports', 'Daily exercise'],
    },
    {
      value: 'very_active',
      title: 'Extremely Active',
      description: 'Very hard exercise, physical job',
      icon: '🔥',
      examples: ['Professional athlete', 'Construction work', 'Military training', 'Elite fitness'],
    },
  ];

  const handleSelect = (level: string) => {
    // Store activity level in onboarding context
    setActivityLevel(level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active');
    console.log('Selected activity level:', level);
    router.push('/onboarding/dietary-preferences');
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
          <Text style={styles.headerTitle}>Activity Level</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%', backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 6 of 10</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            How active are you?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            This helps us create the right workout intensity for you
          </Text>

          <View style={styles.levelsContainer}>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.levelCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => handleSelect(level.value)}
              >
                <View style={styles.levelHeader}>
                  <Text style={styles.levelIcon}>{level.icon}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={[styles.levelTitle, { color: theme.text }]}>
                      {level.title}
                    </Text>
                    <Text style={[styles.levelDescription, { color: theme.textSecondary }]}>
                      {level.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.examplesContainer}>
                  <Text style={[styles.examplesTitle, { color: theme.textSecondary }]}>
                    Examples:
                  </Text>
                  <View style={styles.examplesList}>
                    {level.examples.map((example, index) => (
                      <Text key={index} style={[styles.exampleItem, { color: theme.textSecondary }]}>
                        • {example}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
  levelsContainer: {
    flex: 1,
  },
  levelCard: {
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
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelDescription: {
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
});

export default ActivityLevelScreen;
